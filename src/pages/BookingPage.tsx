
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Car, User, Phone, MessageSquare, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/PageHeader';

interface Garage {
  id: string;
  name: string;
  location: string;
  services: string[];
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

const BookingPage = () => {
  const { garageId, serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [garage, setGarage] = useState<Garage | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleType: 'car',
    bookingDate: '',
    bookingTime: '',
    notes: '',
    paymentMethod: 'pay_after_service'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchGarageAndService();
  }, [garageId, serviceId]);

  const fetchGarageAndService = async () => {
    try {
      // Fetch garage
      const { data: garageData, error: garageError } = await supabase
        .from('garages')
        .select('*')
        .eq('id', garageId)
        .single();

      if (garageError) throw garageError;
      setGarage(garageData);

      // Fetch service
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (serviceError) throw serviceError;
      setService(serviceData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.customerPhone.replace(/\D/g, ''))) {
      newErrors.customerPhone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.vehicleMake.trim()) {
      newErrors.vehicleMake = 'Vehicle make is required';
    }

    if (!formData.vehicleModel.trim()) {
      newErrors.vehicleModel = 'Vehicle model is required';
    }

    if (!formData.bookingDate) {
      newErrors.bookingDate = 'Booking date is required';
    }

    if (!formData.bookingTime) {
      newErrors.bookingTime = 'Booking time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user || !garage || !service) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          garage_id: garage.id,
          service_id: service.id,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          vehicle_make: formData.vehicleMake,
          vehicle_model: formData.vehicleModel,
          vehicle_type: formData.vehicleType,
          booking_date: formData.bookingDate,
          booking_time: formData.bookingTime,
          notes: formData.notes,
          total_amount: service.price,
          payment_method: formData.paymentMethod,
          status: 'confirmed'
        });

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: "Your service has been booked successfully.",
      });

      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!garage || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Service not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <PageHeader title="Book Service" backTo="/services" />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Service Summary */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{service.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-gray-600">{garage.name}</span>
              <span className="font-bold text-lg text-red-600">₹{service.price}</span>
            </div>
            <p className="text-sm text-gray-500">{service.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {service.duration} mins
              </div>
              <div className="flex items-center">
                <Car className="h-4 w-4 mr-1" />
                {garage.location}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.customerName ? 'border-red-500' : ''}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-red-500">{errors.customerName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      placeholder="Enter your email"
                      className={errors.customerEmail ? 'border-red-500' : ''}
                    />
                    {errors.customerEmail && (
                      <p className="text-sm text-red-500">{errors.customerEmail}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Mobile Number *
                  </Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="Enter your 10-digit mobile number"
                    className={errors.customerPhone ? 'border-red-500' : ''}
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-red-500">{errors.customerPhone}</p>
                  )}
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  Vehicle Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMake">Vehicle Make *</Label>
                    <Input
                      id="vehicleMake"
                      value={formData.vehicleMake}
                      onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                      placeholder="e.g., Toyota, Honda"
                      className={errors.vehicleMake ? 'border-red-500' : ''}
                    />
                    {errors.vehicleMake && (
                      <p className="text-sm text-red-500">{errors.vehicleMake}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">Vehicle Model *</Label>
                    <Input
                      id="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                      placeholder="e.g., Camry, Civic"
                      className={errors.vehicleModel ? 'border-red-500' : ''}
                    />
                    {errors.vehicleModel && (
                      <p className="text-sm text-red-500">{errors.vehicleModel}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange('vehicleType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Booking Schedule */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bookingDate">Date *</Label>
                    <Input
                      id="bookingDate"
                      type="date"
                      value={formData.bookingDate}
                      onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={errors.bookingDate ? 'border-red-500' : ''}
                    />
                    {errors.bookingDate && (
                      <p className="text-sm text-red-500">{errors.bookingDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bookingTime">Time *</Label>
                    <Input
                      id="bookingTime"
                      type="time"
                      value={formData.bookingTime}
                      onChange={(e) => handleInputChange('bookingTime', e.target.value)}
                      className={errors.bookingTime ? 'border-red-500' : ''}
                    />
                    {errors.bookingTime && (
                      <p className="text-sm text-red-500">{errors.bookingTime}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any specific requirements or notes..."
                  rows={3}
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Payment Method
                </Label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pay_after_service"
                      name="paymentMethod"
                      value="pay_after_service"
                      checked={formData.paymentMethod === 'pay_after_service'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="text-red-600"
                    />
                    <Label htmlFor="pay_after_service" className="cursor-pointer">
                      Pay After Service Completion
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-6">
                    Payment will be collected after the service is completed
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;
