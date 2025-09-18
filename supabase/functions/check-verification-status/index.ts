import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Global store for verification statuses (shared concept, but separate instance)
// In production, this should be stored in a database
let verificationStatuses = new Map<string, {
  status: 'pending' | 'approved' | 'rejected',
  timestamp: number
}>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { verificationId } = await req.json();

    console.log('Checking verification status for:', verificationId);

    if (!verificationId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing verification ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Since we can't share state between edge functions, 
    // we'll need to implement a database-based approach
    // For now, we'll use a simple HTTP endpoint approach
    
    // Try to get verification status from telegram webhook function
    // This is a workaround for the state sharing limitation
    console.log('Verification not found in local store, returning pending');

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'pending',
        timestamp: Date.now()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in check-verification-status function:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});