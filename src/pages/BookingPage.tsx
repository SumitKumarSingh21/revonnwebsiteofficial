
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Star, Phone, User, Car, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Garage {
  id: string;
  name: string;
  location: string;
  image_url?: string;
  average_rating: number;
  total_reviews: number;
  working_hours: any;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
}

const BookingPage = () => {
  const { garageId, serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [garage, setGarage] = useState<Garage | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: user?.email || '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleType: 'car',
    bookingDate: '',
    bookingTime: '',
    notes: ''
  });

  useEffect(() => {
    if (garageId) {
      fetchGarageData();
    }
  }, [garageId]);

  useEffect(() => {
    if (serviceId && services.length > 0) {
      setSelectedServices([serviceId]);
    }
  }, [serviceId, services]);

  const fetchGarageData = async () => {
    try {
      setLoading(true);
      
      // Fetch garage details
      const { data: garageData, error: garageError } = await supabase
        .from('garages')
        .select('*')
        .eq('id', garageId)
        .single();

      if (garageError) throw garageError;
      setGarage(garageData);

      // Fetch services for this garage
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('garage_id', garageId);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

    } catch (error: any) {
      console.error('Error fetching garage data:', error);
      toast({
        title: "Error",
        description: "Failed to load garage information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const getSelectedServicesData = () => {
    return services.filter(service => selectedServices.includes(service.id));
  };

  const getTotalAmount = () => {
    return getSelectedServicesData().reduce((total, service) => total + service.price, 0);
  };

  const getTotalDuration = () => {
    return getSelectedServicesData().reduce((total, service) => total + service.duration, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a booking.",
        variant: "destructive",
      });
      return;
    }

    if (selectedServices.length === 0) {
      toast({
        title: "Services Required",
        description: "Please select at least one service to book.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.customerName || !formData.customerPhone || !formData.vehicleMake || 
        !formData.vehicleModel || !formData.bookingDate || !formData.bookingTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    if (!phoneRegex.test(formData.customerPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create bookings for each selected service
      const selectedServicesData = getSelectedServicesData();
      const bookingPromises = selectedServicesData.map(async (service) => {
        const { error } = await supabase
          .from('bookings')
          .insert({
            user_id: user.id,
            garage_id: garageId,
            service_id: service.id,
            customer_name: formData.customerName,
            customer_phone: formData.customerPhone,
            customer_email: formData.customerEmail,
            vehicle_make: formData.vehicleMake,
            vehicle_model: formData.vehicleModel,
            vehicle_type: formData.vehicleType,
            booking_date: formData.bookingDate,
            booking_time: formData.bookingTime,
            total_amount: service.price,
            notes: formData.notes,
            status: 'confirmed'
          });

        if (error) throw error;
      });

      await Promise.all(bookingPromises);

      // Send notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'booking_confirmation',
          title: 'Booking Confirmed',
          message: `Your booking for ${selectedServicesData.length} service(s) has been confirmed.`,
          data: {
            garage_id: garageId,
            service_count: selectedServicesData.length,
            total_amount: getTotalAmount()
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      toast({
        title: "Booking Confirmed!",
        description: `${selectedServicesData.length} service(s) booked successfully.`,
      });
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!garage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Garage Not Found</h2>
          <p className="text-gray-600 mb-4">The garage you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/services')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" onClick={() => navigate('/services')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Book Service</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Garage Information */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {garage.image_url && (
                    <img
                      src={garage.image_url}
                      alt={garage.name}
                      className="w-full sm:w-20 sm:h-20 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{garage.name}</h2>
                    <div className="flex items-center space-x-2 mt-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">{garage.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{garage.average_rating}</span>
                      <span className="text-gray-500 text-sm">({garage.total_reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Services</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  {services.map((service) => {
                    const isSelected = selectedServices.includes(service.id);

                    return (
                      <div
                        key={service.id}
                        className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleServiceToggle(service.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            checked={isSelected}
                            onChange={() => handleServiceToggle(service.id)}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                {service.description && (
                                  <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                                )}
                                <div className="flex items-center space-x-4 mt-2">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {service.duration} min
                                  </div>
                                  {service.category && (
                                    <Badge variant="secondary" className="text-xs">
                                      {service.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold text-red-600">₹{service.price}</span>
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Customer Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">Mobile Number *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="Enter your mobile number"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      placeholder="Enter your email"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Car className="h-4 w-4 mr-2" />
                    Vehicle Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange('vehicleType', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicleMake">Make *</Label>
                      <Input
                        id="vehicleMake"
                        value={formData.vehicleMake}
                        onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                        placeholder="e.g., Toyota"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicleModel">Model *</Label>
                      <Input
                        id="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                        placeholder="e.g., Camry"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Booking Schedule */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Schedule</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bookingDate">Date *</Label>
                      <Input
                        id="bookingDate"
                        type="date"
                        value={formData.bookingDate}
                        onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bookingTime">Time *</Label>
                      <Input
                        id="bookingTime"
                        type="time"
                        value={formData.bookingTime}
                        onChange={(e) => handleInputChange('bookingTime', e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any special instructions or requirements..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Selected Services Summary */}
                {selectedServices.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Selected Services</h4>
                    <div className="space-y-2">
                      {getSelectedServicesData().map((service) => (
                        <div key={service.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-gray-600">{service.duration} minutes</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">₹{service.price}</p>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center font-bold">
                          <span>Total ({getTotalDuration()} min)</span>
                          <span className="text-red-600">₹{getTotalAmount()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={submitting || selectedServices.length === 0}
                >
                  {submitting ? 'Booking...' : `Confirm Booking (₹${getTotalAmount()})`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
