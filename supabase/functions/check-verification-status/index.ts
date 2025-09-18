import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { verificationId } = await req.json();

    console.log('Checking verification status for:', verificationId);

    if (!verificationId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing verification ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get verification from database
    const { data: verification, error: dbError } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('verification_id', verificationId)
      .single();

    if (dbError || !verification) {
      console.log('Verification not found:', verificationId);
      return new Response(
        JSON.stringify({ success: false, message: 'Verification not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if verification has expired (5 minutes)
    const now = new Date();
    const createdAt = new Date(verification.created_at);
    const fiveMinutes = 5 * 60 * 1000;
    
    if (now.getTime() - createdAt.getTime() > fiveMinutes && verification.status === 'pending') {
      // Update status to expired
      await supabase
        .from('verification_requests')
        .update({ status: 'expired' })
        .eq('verification_id', verificationId);
        
      return new Response(
        JSON.stringify({ success: true, status: 'expired' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Verification status:', verification.status);

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: verification.status,
        timestamp: verification.created_at
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in check-verification-status function:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});