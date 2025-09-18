import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const bulkpeApiKey = Deno.env.get('BULKPE_API_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { 
      bookingId, 
      amount, 
      customerName, 
      customerEmail, 
      customerPhone 
    } = await req.json();

    console.log('Creating Bulkpe payment for booking:', bookingId, 'amount:', amount);

    // Verify booking exists and belongs to the user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Create unique reference ID combining booking ID and timestamp
    const referenceId = `${bookingId}_${Date.now()}`;
    
    // Create payment with Bulkpe using the specified API
    const paymentPayload = {
      reference_id: referenceId,
      amount: amount, // Use amount as-is (no conversion to paise for this API)
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      success_url: 'https://revonn.com/payment-success',
      failure_url: 'https://revonn.com/payment-failed'
    };

    console.log('Sending payment request to Bulkpe:', paymentPayload);

    const bulkpeResponse = await fetch('https://api.bulkpe.in/client/createPGCollection', {
      method: 'POST',
      headers: {
        'x-api-key': bulkpeApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    });

    let responseText: string | undefined;
    let paymentData: any = null;

    try {
      responseText = await bulkpeResponse.text();
      console.log('Bulkpe response:', responseText);
      paymentData = responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      console.error('Failed to parse Bulkpe response');
    }

    if (!bulkpeResponse.ok || paymentData?.status === false) {
      const message = paymentData?.message || `BulkPe API error (${bulkpeResponse.status})`;
      console.error('BulkPe API returned error:', message);
      return new Response(JSON.stringify({
        success: false,
        error: message,
        code: bulkpeResponse.status,
      }), {
        status: bulkpeResponse.status || 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parsed response JSON
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Keep paymentData as any for flexibility

    // Update booking with payment reference
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_reference: referenceId,
        payment_status: 'pending',
        payment_gateway_response: paymentData
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      throw updateError;
    }

    console.log('Payment created successfully:', paymentData);

    // Get redirect URL from response (result.redirectUrl as specified)
    const paymentUrl = paymentData?.result?.redirectUrl;

    if (!paymentUrl || typeof paymentUrl !== 'string' || !/^https?:\/\//.test(paymentUrl)) {
      console.error('No valid redirect URL found in Bulkpe response:', paymentData);
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing or invalid payment redirect URL in gateway response'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      paymentUrl,
      referenceId,
      paymentData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating Bulkpe payment:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});