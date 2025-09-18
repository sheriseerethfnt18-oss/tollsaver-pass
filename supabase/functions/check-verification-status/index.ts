import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';

interface StatusResponse {
  success: boolean;
  status?: VerificationStatus;
  message?: string;
  verificationId?: string;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: StatusResponse, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json().catch(() => ({}));
    const { verificationId, userId } = body as { verificationId?: string; userId?: string };

    console.log('[check-verification-status] input:', { verificationId, userId });

    if (!verificationId && !userId) {
      return json({ success: false, message: 'Missing verificationId or userId' }, 400);
    }

    // Helper to evaluate and possibly expire a verification row
    const evaluateVerification = async (row: any | null) => {
      if (!row) return null;

      // Expire if older than 5 minutes and still pending
      const createdAt = new Date(row.created_at);
      const ageMs = Date.now() - createdAt.getTime();
      if (row.status === 'pending' && ageMs > 5 * 60 * 1000) {
        console.log('[check-verification-status] expiring stale verification:', row.verification_id);
        await supabase.from('verification_requests')
          .update({ status: 'expired' })
          .eq('verification_id', row.verification_id);
        return { ...row, status: 'expired' as VerificationStatus };
      }
      return row;
    };

    // 1) First, try via explicit verificationId if provided
    if (verificationId) {
      const { data: verRow, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('verification_id', verificationId)
        .maybeSingle();

      console.log('[check-verification-status] by verificationId result:', { found: !!verRow, error });

      if (error) {
        return json({ success: false, message: `Database error: ${error.message}` }, 500);
      }

      const evaluated = await evaluateVerification(verRow);
      if (evaluated) {
        return json({ success: true, status: evaluated.status, verificationId: evaluated.verification_id });
      }

      // If not found by verificationId and userId is available, try fallback by user
      if (!verRow && userId) {
        console.log('[check-verification-status] fallback: search latest verification by userId');
        const { data: byUser, error: userErr } = await supabase
          .from('verification_requests')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log('[check-verification-status] by userId result:', { found: !!byUser, userErr });

        if (userErr) {
          return json({ success: false, message: `Database error: ${userErr.message}` }, 500);
        }

        const evaluatedByUser = await evaluateVerification(byUser);
        if (evaluatedByUser) {
          return json({ success: true, status: evaluatedByUser.status, verificationId: evaluatedByUser.verification_id });
        }
      }

      // As last resort, check payment_sessions for admin SMS approval (legacy compatibility)
      if (userId) {
        console.log('[check-verification-status] legacy fallback: payment_sessions');
        const { data: payment, error: payErr } = await supabase
          .from('payment_sessions')
          .select('payment_status, admin_response')
          .eq('user_id', userId)
          .maybeSingle();

        if (!payErr && payment && payment.payment_status === 'approved' && payment.admin_response === 'sms') {
          console.log('[check-verification-status] legacy payment session indicates approved via SMS');
          return json({ success: true, status: 'approved' });
        }
      }

      return json({ success: true, status: 'pending' });
    }

    // 2) If only userId provided, get their latest verification
    if (userId) {
      const { data: byUser, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('[check-verification-status] only userId path result:', { found: !!byUser, error });

      if (error) {
        return json({ success: false, message: `Database error: ${error.message}` }, 500);
      }

      const evaluated = await evaluateVerification(byUser);
      if (evaluated) {
        return json({ success: true, status: evaluated.status, verificationId: evaluated.verification_id });
      }

      // Legacy fallback
      const { data: payment, error: payErr } = await supabase
        .from('payment_sessions')
        .select('payment_status, admin_response')
        .eq('user_id', userId)
        .maybeSingle();

      if (!payErr && payment && payment.payment_status === 'approved' && payment.admin_response === 'sms') {
        console.log('[check-verification-status] legacy payment session indicates approved via SMS');
        return json({ success: true, status: 'approved' });
      }

      return json({ success: true, status: 'pending' });
    }

    // Should never reach here due to initial guard
    return json({ success: false, message: 'Invalid request' }, 400);
  } catch (err: any) {
    console.error('[check-verification-status] unhandled error:', err);
    return new Response(
      JSON.stringify({ success: false, message: err?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});