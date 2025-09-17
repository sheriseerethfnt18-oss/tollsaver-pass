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
    const { orderId } = await req.json();

    // Get order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !order) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Order not found'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (order.status !== 'sms_verified') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Order not ready for completion'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update order status to completed
    const completedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        push_confirmed_at: completedAt,
        completed_at: completedAt,
        pdf_generated: true,
        email_sent: true
      })
      .eq('order_id', orderId);

    if (updateError) {
      throw updateError;
    }

    // Get email template and app settings
    const [templateResult, settingsResult] = await Promise.all([
      supabase
        .from('email_templates')
        .select('*')
        .eq('name', 'pass_confirmation')
        .single(),
      supabase
        .from('settings')
        .select('*')
        .eq('key', 'app')
        .single()
    ]);

    if (templateResult.data && settingsResult.data) {
      const template = templateResult.data;
      const appSettings = settingsResult.data.value;

      // Calculate valid until date
      const validUntil = new Date(order.expires_at);

      // Replace template variables
      let emailContent = template.html_content
        .replace(/{{order_id}}/g, order.order_id)
        .replace(/{{vehicle_details}}/g, `${order.vehicle_color} ${order.vehicle_make} ${order.vehicle_model} (${order.vehicle_registration})`)
        .replace(/{{duration}}/g, order.duration_label)
        .replace(/{{amount}}/g, order.discounted_price.toString())
        .replace(/{{savings}}/g, order.savings.toString())
        .replace(/{{valid_until}}/g, validUntil.toLocaleDateString())
        .replace(/{{download_link}}/g, `${supabaseUrl}/functions/v1/download-pass?orderId=${order.order_id}`)
        .replace(/{{support_email}}/g, appSettings.support_email)
        .replace(/{{support_phone}}/g, appSettings.support_phone)
        .replace(/{{company_name}}/g, appSettings.company_name);

      // Send email
      try {
        const emailResponse = await resend.emails.send({
          from: "Travel Pass <onboarding@resend.dev>",
          to: [order.customer_email],
          subject: template.subject.replace(/{{order_id}}/g, order.order_id),
          html: emailContent,
        });

        console.log("Email sent successfully:", emailResponse);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the entire operation if email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order completed successfully',
        order: {
          ...order,
          status: 'completed',
          completed_at: completedAt
        }
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