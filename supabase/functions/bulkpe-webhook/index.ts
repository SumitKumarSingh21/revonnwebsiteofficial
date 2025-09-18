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
    
    const webhookData = await req.json();
    console.log('Received Bulkpe webhook:', JSON.stringify(webhookData, null, 2));

    // Extract payment information from webhook
    const paymentId = webhookData.id || webhookData.order_id;
    const paymentStatus = webhookData.status;
    const receipt = webhookData.receipt;
    const reference_id = webhookData.reference_id; // New field for updated API

    if (!paymentId && !reference_id) {
      console.error('Missing payment ID or reference ID in webhook');
      return new Response('Missing required fields', { status: 400 });
    }

    // Extract booking ID from reference_id (format: bookingId_timestamp) or receipt (format: booking_bookingId)
    let bookingId;
    let paymentReference;

    if (reference_id) {
      // New format: bookingId_timestamp
      bookingId = reference_id.split('_')[0];
      paymentReference = reference_id;
    } else if (receipt) {
      // Legacy format: booking_bookingId
      bookingId = receipt.replace('booking_', '');
      paymentReference = paymentId;
    }
    
    if (!bookingId) {
      console.error('Invalid reference format. Receipt:', receipt, 'Reference ID:', reference_id);
      return new Response('Invalid reference format', { status: 400 });
    }

    console.log('Processing payment webhook for booking:', bookingId, 'status:', paymentStatus);

    // Map Bulkpe status to our payment status
    let newPaymentStatus = 'pending';
    switch (paymentStatus.toLowerCase()) {
      case 'paid':
      case 'captured':
      case 'success':
        newPaymentStatus = 'paid';
        break;
      case 'failed':
      case 'cancelled':
        newPaymentStatus = 'failed';
        break;
      default:
        newPaymentStatus = 'pending';
    }

    // Update booking payment status
    const { data: booking, error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: newPaymentStatus,
        payment_gateway_response: webhookData
      })
      .eq('id', bookingId)
      .eq('payment_reference', paymentReference)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating booking payment status:', updateError);
      return new Response('Database update failed', { status: 500 });
    }

    if (!booking) {
      console.error('Booking not found for payment ID:', paymentId);
      return new Response('Booking not found', { status: 404 });
    }

    console.log('Successfully updated booking payment status:', bookingId, 'to:', newPaymentStatus);

    // If payment successful, you could trigger additional actions here
    if (newPaymentStatus === 'paid') {
      console.log('Payment successful for booking:', bookingId);
      // You could send confirmation emails, SMS, or trigger other workflows here
    }

    return new Response(JSON.stringify({ 
      success: true, 
      bookingId, 
      paymentStatus: newPaymentStatus 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing Bulkpe webhook:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});