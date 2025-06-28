import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Car, FileText, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Service {
  id: string;
  name: string;
  price: number;
  category?: string;
  duration?: number;
}

interface Garage {
  id: string;
  name: string;
  location: string;
}

const BookingPage = () => {
  const { garageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [garage, setGarage] = useState<Garage | null>(null);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    garageName: '',
    vehicleType: 'car',
    vehicleBrand: '',
    vehicleModel: '',
    serviceDate: '',
    serviceTime: '',
    services: [],
    notes: '',
    paymentOption: 'pay-later'
  });

  const carBrands = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'Ford', 'Volkswagen'];
  const carModels = {
    'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Alto', 'Vitara Brezza'],
    'Hyundai': ['i20', 'Creta', 'Verna', 'Grand i10', 'Venue'],
    'Tata': ['Nexon', 'Harrier', 'Safari', 'Altroz', 'Punch'],
    'Honda': ['City', 'Amaze', 'Jazz', 'WR-V', 'CR-V'],
    'Toyota': ['Innova', 'Fortuner', 'Yaris', 'Glanza', 'Urban Cruiser']
  };

  const bikeBrands = ['Honda', 'Hero', 'Bajaj', 'TVS', 'Yamaha', 'Royal Enfield', 'KTM', 'Suzuki'];
  const bikeModels = {
    'Honda': ['Activa', 'CB Shine', 'Unicorn', 'Hornet', 'CBR'],
    'Hero': ['Splendor', 'HF Deluxe', 'Passion', 'Xtreme', 'Destini'],
    'Bajaj': ['Pulsar', 'Platina', 'Avenger', 'Dominar', 'CT'],
    'TVS': ['Apache', 'Jupiter', 'Star City', 'Ntorq', 'Radeon'],
    'Yamaha': ['FZ', 'R15', 'MT', 'Fascino', 'Ray ZR'],
    'Royal Enfield': ['Classic', 'Bullet', 'Himalayan', 'Interceptor', 'Continental GT'],
    'KTM': ['Duke', 'RC', 'Adventure'],
    'Suzuki': ['Gixxer', 'Access', 'Intruder', 'Hayabusa']
  };

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  useEffect(() => {
    if (garageId) {
      fetchGarageAndServices();
    }
  }, [garageId]);

  const fetchGarageAndServices = async () => {
    try {
      setLoading(true);
      
      // Fetch garage details
      const { data: garageData, error: garageError } = await supabase
        .from('garages')
        .select('id, name, location')
        .eq('id', garageId)
        .single();

      if (garageError) throw garageError;

      // Fetch services for this garage
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name, price, category, duration')
        .eq('garage_id', garageId);

      if (servicesError) throw servicesError;

      console.log('Fetched garage:', garageData);
      console.log('Fetched services:', servicesData);

      setGarage(garageData);
      setAvailableServices(servicesData || []);
      setFormData(prev => ({
        ...prev,
        garageName: garageData.name
      }));

    } catch (error: any) {
      console.error('Error fetching garage and services:', error);
      toast({
        title: "Error",
        description: "Failed to load garage information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (serviceId, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, serviceId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(id => id !== serviceId)
      }));
    }
  };

  const calculateTotal = () => {
    return formData.services.reduce((total, serviceId) => {
      const service = availableServices.find(s => s.id === serviceId);
      return total + (service ? service.price : 0);
    }, 0);
  };

  const handleVehicleTypeChange = (type: string) => {
    setFormData({
      ...formData,
      vehicleType: type,
      vehicleBrand: '',
      vehicleModel: ''
    });
  };

  const handleVehicleBrandChange = (brand: string) => {
    setFormData({
      ...formData,
      vehicleBrand: brand,
      vehicleModel: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a service.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.vehicleBrand || !formData.vehicleModel || !formData.serviceDate || !formData.serviceTime || formData.services.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one service.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      // Get the first selected service for the booking
      const primaryServiceId = formData.services[0];
      
      // Create booking in Supabase
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          garage_id: garageId,
          service_id: primaryServiceId,
          booking_date: formData.serviceDate,
          booking_time: formData.serviceTime,
          vehicle_make: formData.vehicleBrand,
          vehicle_model: formData.vehicleModel,
          vehicle_type: formData.vehicleType,
          total_amount: calculateTotal(),
          notes: formData.notes || null,
          customer_name: user.email?.split('@')[0] || 'Customer',
          customer_email: user.email || '',
          payment_method: formData.paymentOption,
          status: 'confirmed'
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Booking error:', bookingError);
        throw bookingError;
      }

      console.log('Booking created successfully:', bookingData);

      toast({
        title: "Booking Confirmed!",
        description: `Your booking at ${formData.garageName} has been confirmed for ${formData.serviceDate}.`,
      });

      // Navigate to profile to see the booking
      navigate('/profile');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!garage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Garage not found</h2>
          <p className="text-gray-500 mb-4">The garage you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/services">Back to Services</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentBrands = formData.vehicleType === 'car' ? carBrands : bikeBrands;
  const currentModels = formData.vehicleType === 'car' 
    ? carModels[formData.vehicleBrand] || [] 
    : bikeModels[formData.vehicleBrand] || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/services">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Book Service</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    Garage Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="garage-name">Selected Garage</Label>
                    <Input
                      id="garage-name"
                      value={formData.garageName}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vehicle-type">Vehicle Type *</Label>
                    <Select value={formData.vehicleType} onValueChange={handleVehicleTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicle-brand">
                        {formData.vehicleType === 'car' ? 'Car Brand' : 'Bike Brand'} *
                      </Label>
                      <Select value={formData.vehicleBrand} onValueChange={handleVehicleBrandChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentBrands.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="vehicle-model">
                        {formData.vehicleType === 'car' ? 'Car Model' : 'Bike Model'} *
                      </Label>
                      <Select 
                        value={formData.vehicleModel} 
                        onValueChange={(value) => setFormData({...formData, vehicleModel: value})} 
                        disabled={!formData.vehicleBrand}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentModels.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service-date">Service Date *</Label>
                      <Input
                        id="service-date"
                        type="date"
                        value={formData.serviceDate}
                        onChange={(e) => setFormData({...formData, serviceDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="service-time">Preferred Time *</Label>
                      <Select value={formData.serviceTime} onValueChange={(value) => setFormData({...formData, serviceTime: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select Services *</CardTitle>
                </CardHeader>
                <CardContent>
                  {availableServices.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No services available for this garage.</p>
                      <p className="text-sm text-gray-400 mt-2">Please contact the garage directly.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableServices.map(service => (
                        <div key={service.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <Checkbox
                            id={service.id}
                            checked={formData.services.includes(service.id)}
                            onCheckedChange={(checked) => handleServiceChange(service.id, checked)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={service.id} className="cursor-pointer">
                              {service.name}
                            </Label>
                            <p className="text-sm text-gray-500">₹{service.price}</p>
                            {service.category && (
                              <p className="text-xs text-gray-400">{service.category}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any specific requirements or issues you'd like to mention..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Garage:</span>
                      <span className="font-medium">{formData.garageName}</span>
                    </div>
                    {formData.vehicleBrand && formData.vehicleModel && (
                      <div className="flex justify-between text-sm">
                        <span>Vehicle:</span>
                        <span className="font-medium">
                          {formData.vehicleBrand} {formData.vehicleModel} ({formData.vehicleType})
                        </span>
                      </div>
                    )}
                    {formData.serviceDate && (
                      <div className="flex justify-between text-sm">
                        <span>Date:</span>
                        <span className="font-medium">{formData.serviceDate}</span>
                      </div>
                    )}
                    {formData.serviceTime && (
                      <div className="flex justify-between text-sm">
                        <span>Time:</span>
                        <span className="font-medium">{formData.serviceTime}</span>
                      </div>
                    )}
                  </div>

                  {formData.services.length > 0 && (
                    <>
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Selected Services:</h4>
                        <div className="space-y-2">
                          {formData.services.map(serviceId => {
                            const service = availableServices.find(s => s.id === serviceId);
                            return service ? (
                              <div key={serviceId} className="flex justify-between text-sm">
                                <span>{service.name}</span>
                                <span>₹{service.price}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>₹{calculateTotal()}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-3">
                    <Label>Payment Option</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="pay-later"
                          name="payment"
                          value="pay-later"
                          checked={formData.paymentOption === 'pay-later'}
                          onChange={(e) => setFormData({...formData, paymentOption: e.target.value})}
                        />
                        <Label htmlFor="pay-later" className="cursor-pointer">Pay after service</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="pay-now"
                          name="payment"
                          value="pay-now"
                          checked={formData.paymentOption === 'pay-now'}
                          onChange={(e) => setFormData({...formData, paymentOption: e.target.value})}
                        />
                        <Label htmlFor="pay-now" className="cursor-pointer">Pay now (5% discount)</Label>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={availableServices.length === 0 || submitting}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {submitting ? 'Confirming...' : 'Confirm Booking'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
