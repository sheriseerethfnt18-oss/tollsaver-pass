import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VehicleInfo {
  registration: string;
  name: string;
  make: string;
  model: string;
  engineCapacity: string;
  color: string;
  import: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vrn } = await req.json();
    
    if (!vrn) {
      return new Response(
        JSON.stringify({ success: false, error: 'Vehicle registration number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const vrnUpper = vrn.toUpperCase().trim();
    const url = `https://www.cartell.ie/ssl/servlet/beginStarLookup?registration=${encodeURIComponent(vrnUpper)}`;

    console.log(`Looking up vehicle: ${vrnUpper}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      console.error(`Error fetching data from Cartell.ie (HTTP ${response.status})`);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch vehicle data (HTTP ${response.status})` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    
    if (!html) {
      return new Response(
        JSON.stringify({ success: false, error: 'No data received from Cartell.ie' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse HTML using DOMParser
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    if (!doc) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse HTML response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Look for vehicle-card
    const vehicleCards = doc.querySelectorAll('div[class*="vehicle-card"]');
    
    if (vehicleCards.length === 0) {
      console.log('No vehicle cards found in response');
      return new Response(
        JSON.stringify({ success: false, error: 'Vehicle not found or no data available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const card = vehicleCards[0];
    
    // Extract data from the card
    const regElement = card.querySelector('span[class*="vehicle-id-mbl"]');
    const nameElement = card.querySelector('p[class*="vehicle-description-mbl"]');
    const engineElement = card.querySelector('p[class*="engine-capacity-mbl"] span[class*="vehicle-value"]');
    const colorElement = card.querySelector('p[class*="car-color-mbl"] span[class*="vehicle-value"]');
    const importElement = card.querySelector('p[class*="car-info-p-mbl"] span[class*="vehicle-value"]');

    const registration = regElement?.textContent?.trim() || vrnUpper;
    const name = nameElement?.textContent?.trim() || '';
    const engineCapacity = engineElement?.textContent?.trim() || '';
    const color = colorElement?.textContent?.trim() || '';
    const importInfo = importElement?.textContent?.trim() || '';

    // Parse make and model from name
    const nameParts = name.split(' ');
    const make = nameParts[0] || '';
    const model = nameParts.slice(1).join(' ') || '';

    const vehicleInfo: VehicleInfo = {
      registration,
      name,
      make: make.toUpperCase(),
      model: model.toUpperCase(),
      engineCapacity,
      color: color.toUpperCase(),
      import: importInfo
    };

    console.log('Vehicle info found:', vehicleInfo);

    return new Response(
      JSON.stringify({ 
        success: true, 
        vehicle: vehicleInfo 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lookup-vehicle function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error while looking up vehicle' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});