import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    console.log('Test webhook called with method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
    } catch (e) {
      console.log('Failed to parse request body as JSON:', e);
      requestBody = null;
    }

    // Get telegram settings to get bot token
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'telegram')
      .single();

    if (!settings) {
      console.log('No telegram settings found');
      return new Response(JSON.stringify({ error: 'No telegram settings' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const telegramSettings = settings.value as any;
    const botToken = telegramSettings.bot_token;

    if (!botToken) {
      console.log('No bot token found');
      return new Response(JSON.stringify({ error: 'No bot token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get current webhook info
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const webhookInfo = await webhookInfoResponse.json();
    console.log('Current webhook info:', webhookInfo);

    // Set webhook URL
    const webhookUrl = `https://kcsvkdhnglpvzdvznmfs.supabase.co/functions/v1/telegram-webhook`;
    console.log('Setting webhook URL to:', webhookUrl);

    const setWebhookResponse = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query']
      })
    });

    const setWebhookResult = await setWebhookResponse.json();
    console.log('Set webhook result:', setWebhookResult);

    return new Response(JSON.stringify({
      success: true,
      webhookInfo,
      setWebhookResult,
      webhookUrl,
      receivedBody: requestBody
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in test webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});