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
    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');

    if (!orderId) {
      return new Response('Order ID required', { status: 400 });
    }

    // Get order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !order) {
      return new Response('Order not found', { status: 404 });
    }

    if (order.status !== 'completed') {
      return new Response('Order not completed', { status: 400 });
    }

    // Generate simple PDF content (in production, use a proper PDF library)
    const pdfContent = generatePassPDF(order);

    return new Response(pdfContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="travel-pass-${order.order_id}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating pass:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

function generatePassPDF(order: any): string {
  // This is a simplified PDF generation. In production, use a proper PDF library like jsPDF
  const pdfHeader = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj

4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

5 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
72 720 Td
(TRAVEL PASS - ORDER #${order.order_id}) Tj
0 -20 Td
(Vehicle: ${order.vehicle_color} ${order.vehicle_make} ${order.vehicle_model}) Tj
0 -20 Td
(Registration: ${order.vehicle_registration}) Tj
0 -20 Td
(Duration: ${order.duration_label}) Tj
0 -20 Td
(Valid until: ${new Date(order.expires_at).toLocaleDateString()}) Tj
0 -20 Td
(Amount paid: €${order.discounted_price}) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000252 00000 n 
0000000317 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
567
%%EOF`;

  return pdfHeader;
}