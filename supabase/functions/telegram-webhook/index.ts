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
    console.log('Telegram webhook received:', body);

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

    // Handle different types of messages/callbacks
    if (body.message) {
      // Handle incoming messages
      const message = body.message;
      console.log('Received message:', message.text);
      
      // You can add message handling logic here
      // For example, responding to specific commands
    }

    if (body.callback_query) {
      // Handle callback queries from inline keyboards
      const callbackQuery = body.callback_query;
      console.log('Received callback query:', callbackQuery.data);
      
      // You can add callback handling logic here
    }

    return new Response('OK', { headers: corsHeaders });
  } catch (error) {
    console.error('Error in telegram webhook:', error);
    return new Response('Error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});