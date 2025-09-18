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
  type: 'user_info' | 'form_submission' | 'vehicle_lookup';
  data: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    const { type, data } = await req.json() as NotificationData;

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

    let chatId = '';
    let message = '';

    switch (type) {
      case 'user_info':
        chatId = telegramSettings.info_chat_id;
        message = `🔍 *User Info Alert*\n\n` +
                 `🌍 IP: ${data.ip || 'N/A'}\n` +
                 `🏴 Country: ${data.country || 'N/A'}\n` +
                 `🏙️ City: ${data.city || 'N/A'}\n` +
                 `🌐 Region: ${data.region || 'N/A'}\n` +
                 `⏰ Timezone: ${data.timezone || 'N/A'}\n` +
                 `📡 ISP: ${data.isp || 'N/A'}\n` +
                 `📱 UA: ${data.userAgent || 'N/A'}\n` +
                 `📧 Email: ${data.email || 'N/A'}\n` +
                 `🕐 Time: ${new Date().toISOString()}`;
        break;

      case 'form_submission':
        chatId = telegramSettings.form_chat_id;
        message = `📝 *Form Submission*\n\n` +
                 `👤 Name: ${data.name || 'N/A'}\n` +
                 `📧 Email: ${data.email || 'N/A'}\n` +
                 `📞 Phone: ${data.phone || 'N/A'}\n` +
                 `🚗 Registration: ${data.vehicle_registration || 'N/A'}\n` +
                 `⏰ Duration: ${data.duration || 'N/A'}\n` +
                 `💰 Price: ${data.price || 'N/A'}\n` +
                 `🕐 Time: ${new Date().toISOString()}`;
        break;

      case 'vehicle_lookup':
        chatId = telegramSettings.form_chat_id;
        const testModeFlag = data.test_mode ? ' (TEST MODE)' : '';
        message = `🚗 *Vehicle Found${testModeFlag}*\n\n` +
                 `📋 Registration: ${data.registration || 'N/A'}\n` +
                 `🏭 Make: ${data.make || 'N/A'}\n` +
                 `🚙 Model: ${data.model || 'N/A'}\n` +
                 `🎨 Color: ${data.color || 'N/A'}\n` +
                 `🕐 Time: ${new Date().toISOString()}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid notification type' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
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

    // Send message to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${telegramSettings.bot_token}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

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