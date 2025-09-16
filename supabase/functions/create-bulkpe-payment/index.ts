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

    // Create payment with Bulkpe
    const paymentPayload = {
      amount: amount * 100, // Convert to paise (Bulkpe expects amount in paise)
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      callback_url: `${supabaseUrl}/functions/v1/bulkpe-webhook`,
      callback_method: 'POST'
    };

    console.log('Sending payment request to Bulkpe:', paymentPayload);

    const bulkpeResponse = await fetch('https://api.bulkpe.in/v1/order/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bulkpeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    });

    const responseText = await bulkpeResponse.text();
    console.log('Bulkpe response:', responseText);

    if (!bulkpeResponse.ok) {
      throw new Error(`Bulkpe API error: ${responseText}`);
    }

    const paymentData = JSON.parse(responseText);

    // Update booking with payment reference
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_reference: paymentData.id || paymentData.order_id,
        payment_status: 'pending',
        payment_gateway_response: paymentData
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      throw updateError;
    }

    console.log('Payment created successfully:', paymentData);

    return new Response(JSON.stringify({
      success: true,
      paymentUrl: paymentData.short_url || paymentData.payment_url,
      paymentId: paymentData.id || paymentData.order_id,
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