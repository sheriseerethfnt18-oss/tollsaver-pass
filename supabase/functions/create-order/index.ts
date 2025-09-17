import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const {
      customerInfo,
      vehicleInfo,
      durationInfo,
      paymentInfo
    } = await req.json();

    // Generate unique order ID
    const orderId = `TP${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Generate SMS code
    const smsCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationInfo.days);

    // Create order in database
    const { data: order, error } = await supabase
      .from('orders')
      .insert([
        {
          order_id: orderId,
          customer_email: customerInfo.email,
          customer_name: customerInfo.fullName,
          customer_phone: customerInfo.phone,
          vehicle_registration: vehicleInfo.registration,
          vehicle_make: vehicleInfo.make,
          vehicle_model: vehicleInfo.model,
          vehicle_color: vehicleInfo.color,
          duration_days: durationInfo.days,
          duration_label: durationInfo.label,
          original_price: durationInfo.originalPrice,
          discounted_price: durationInfo.discountedPrice,
          savings: durationInfo.savings,
          status: 'sms_sent',
          sms_code: smsCode,
          expires_at: expiresAt.toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Simulate SMS sending (in production, integrate with SMS provider)
    console.log(`SMS Code for ${customerInfo.phone}: ${smsCode}`);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderId,
        smsCode: smsCode, // Remove this in production
        message: 'Order created and SMS sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error creating order:', error);
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