import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RotateCcw, Home, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const paymentId = searchParams.get('payment_id');
  const bookingId = searchParams.get('booking_id');
  const reason = searchParams.get('reason');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!booking) return;
    
    setRetrying(true);
    try {
      const { data: paymentResponse, error: paymentError } = await supabase.functions.invoke('create-bulkpe-payment', {
        body: {
          bookingId: booking.id,
          amount: booking.total_amount,
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          customerPhone: booking.customer_phone
        }
      });

      if (paymentError || !paymentResponse.success) {
        throw new Error(paymentResponse?.error || 'Failed to create payment');
      }

      // Redirect to payment URL
      window.location.href = paymentResponse.paymentUrl;
      
    } catch (error: any) {
      console.error('Payment retry failed:', error);
      toast({
        title: "Retry Failed",
        description: "Failed to create new payment link. Please try again later.",
        variant: "destructive"
      });
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardContent className="p-8 text-center">
            {/* Failed Icon */}
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Failed Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment could not be processed. Don't worry, your booking is still reserved for 5 minutes.
            </p>

            {/* Failure Reason */}
            {reason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-800">
                  <strong>Reason:</strong> {reason}
                </p>
              </div>
            )}

            {/* Booking Details */}
            {booking && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{booking.service_names || 'Vehicle Service'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">
                      {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">{booking.vehicle_make} {booking.vehicle_model}</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-red-600">₹{booking.total_amount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Options */}
            <div className="bg-yellow-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-yellow-900 mb-2">
                What can you do?
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Try the payment again</li>
                <li>• Choose "Cash on Service" instead</li>
                <li>• Contact support for assistance</li>
                <li>• Check your bank account/card details</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {booking && (
                <Button 
                  onClick={handleRetryPayment}
                  disabled={retrying}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {retrying ? 'Creating Payment Link...' : 'Retry Payment'}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => navigate(`/book/${booking?.garage_id}`)}
                className="w-full"
              >
                Choose Cash on Service
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>

            {/* Support Link */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-gray-500 mb-2">Need help with your payment?</p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/support')}
                className="text-blue-600"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFailed;