import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import jsPDF from "npm:jspdf@2.5.1";
import QRCode from "npm:qrcode@1.5.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PassData {
  orderId: string;
  vehicle: {
    registration: string;
    make: string;
    model: string;
    color: string;
  };
  duration: {
    label: string;
    days: number;
    discountedPrice: number;
    savings: number;
  };
  customerInfo: {
    fullName: string;
    email: string;
  };
  activationDate: string;
  expiryDate: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    console.log('PDF generation request received');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Get the request body as text first to debug
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);
    
    if (!rawBody || rawBody.trim() === '') {
      console.error('Empty request body received');
      return new Response(
        JSON.stringify({ error: 'Empty request body' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the JSON
    let passData: PassData;
    try {
      passData = JSON.parse(rawBody);
      console.log('Parsed pass data:', JSON.stringify(passData, null, 2));
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!passData.orderId || !passData.vehicle || !passData.duration) {
      console.error('Missing required fields:', {
        hasOrderId: !!passData.orderId,
        hasVehicle: !!passData.vehicle,
        hasDuration: !!passData.duration
      });
      return new Response(
        JSON.stringify({ error: 'Missing required pass data' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating PDF for order:', passData.orderId);

    // Generate QR code data URL
    const qrData = JSON.stringify({
      orderId: passData.orderId,
      registration: passData.vehicle.registration,
      expires: passData.expiryDate
    });
    
    console.log('Generating QR code...');
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log('Creating PDF document...');
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set up the PDF styling
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add green background header
    pdf.setFillColor(34, 139, 34); // Green color
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    // Add title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('IRISH TRAVEL PASS', pageWidth / 2, 25, { align: 'center' });
    
    // Reset text color for body
    pdf.setTextColor(0, 0, 0);
    
    // Add pass details section
    let yPos = 60;
    
    // Order information
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Pass Details', 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    
    // Order ID
    pdf.setFont(undefined, 'bold');
    pdf.text('Order Number:', 20, yPos);
    pdf.setFont(undefined, 'normal');
    pdf.text(passData.orderId, 70, yPos);
    
    yPos += 10;
    pdf.setFont(undefined, 'bold');
    pdf.text('Pass Type:', 20, yPos);
    pdf.setFont(undefined, 'normal');
    pdf.text(passData.duration.label, 70, yPos);
    
    yPos += 10;
    pdf.setFont(undefined, 'bold');
    pdf.text('Amount Paid:', 20, yPos);
    pdf.setFont(undefined, 'normal');
    pdf.text(`€${passData.duration.discountedPrice.toFixed(2)}`, 70, yPos);
    
    yPos += 10;
    pdf.setFont(undefined, 'bold');
    pdf.text('You Saved:', 20, yPos);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(34, 139, 34);
    pdf.text(`€${passData.duration.savings.toFixed(2)}`, 70, yPos);
    pdf.setTextColor(0, 0, 0);
    
    yPos += 20;
    
    // Vehicle information
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Vehicle Information', 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    
    pdf.setFont(undefined, 'bold');
    pdf.text('Registration:', 20, yPos);
    pdf.setFont(undefined, 'normal');
    pdf.text(passData.vehicle.registration, 70, yPos);
    
    yPos += 10;
    pdf.setFont(undefined, 'bold');
    pdf.text('Vehicle:', 20, yPos);
    pdf.setFont(undefined, 'normal');
    pdf.text(`${passData.vehicle.color} ${passData.vehicle.make} ${passData.vehicle.model}`, 70, yPos);
    
    yPos += 20;
    
    // Validity information
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Validity Period', 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    
    pdf.setFont(undefined, 'bold');
    pdf.text('Activated:', 20, yPos);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date(passData.activationDate).toLocaleDateString(), 70, yPos);
    
    yPos += 10;
    pdf.setFont(undefined, 'bold');
    pdf.text('Expires:', 20, yPos);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date(passData.expiryDate).toLocaleDateString(), 70, yPos);
    
    // Add QR code
    console.log('Adding QR code to PDF...');
    pdf.addImage(qrCodeDataURL, 'PNG', pageWidth - 60, 60, 40, 40);
    
    // Add QR code label
    pdf.setFontSize(10);
    pdf.text('Scan for verification', pageWidth - 60, 110, { align: 'center', maxWidth: 40 });
    
    // Add footer with terms
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    const footerY = pageHeight - 30;
    
    pdf.text('Terms & Conditions:', 20, footerY);
    pdf.text('• Valid on all Irish toll roads during the specified period', 20, footerY + 5);
    pdf.text('• Non-transferable and valid only for the registered vehicle', 20, footerY + 10);
    pdf.text('• Keep this pass with you while traveling', 20, footerY + 15);
    pdf.text('• For support: support@travel-pass.live | 0818 501 050', 20, footerY + 20);
    
    console.log('Generating PDF buffer...');
    // Generate PDF as buffer
    const pdfBuffer = pdf.output('arraybuffer');
    console.log('PDF generated successfully, size:', pdfBuffer.byteLength);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="travel-pass-${passData.orderId}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF', details: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});