import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useMechanicAvailability } from '@/hooks/useMechanicAvailability';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, Car, FileText, MapPin, Home, Star, Shield } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

interface Garage {
  id: string;
  name: string;
  location: string;
  image_url: string;
  rating: number;
  total_reviews: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

const BookingPage = () => {
  const { garageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [garage, setGarage] = useState<Garage | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [bookingDate, setBookingDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [serviceType, setServiceType] = useState<'pickup' | 'home_service'>('pickup');
  const [serviceAddress, setServiceAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { timeSlots, loading: timeSlotsLoading, formatTimeSlot } = useTimeSlots(garageId || '', bookingDate);
  const { getAvailableMechanicForSlot } = useMechanicAvailability(garageId || '', bookingDate);

  useEffect(() => {
    if (garageId) {
      fetchGarageAndServices();
    }
  }, [garageId]);

  const fetchGarageAndServices = async () => {
    if (!garageId) return;

    try {
      // Fetch garage details
      const { data: garageData, error: garageError } = await supabase
        .from('garages')
        .select('*')
        .eq('id', garageId)
        .single();

      if (garageError) throw garageError;
      setGarage(garageData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('garage_id', garageId);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load garage information",
        variant: "destructive",
      });
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotal = () => {
    let baseTotal = selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);

    // Add service fee for home service
    if (serviceType === 'home_service') {
      baseTotal += 49; // ₹49 additional fee for home service
    }

    return baseTotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a booking",
        variant: "destructive",
      });
      return;
    }

    if (selectedServices.length === 0) {
      toast({
        title: "No Services Selected", 
        description: "Please select at least one service",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTimeSlot) {
      toast({
        title: "No Time Selected",
        description: "Please select a time slot",
        variant: "destructive",
      });
      return;
    }

    if (!serviceAddress.trim()) {
      toast({
        title: "Address Required",
        description: `Please provide your address for ${serviceType === 'home_service' ? 'home service' : 'pickup service'}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get available mechanic for the selected time slot
      const availableMechanic = getAvailableMechanicForSlot(selectedTimeSlot);
      
      console.log('Available mechanic for booking:', availableMechanic);

      // Get selected services with their names
      const selectedServiceDetails = selectedServices.map(serviceId => {
        const service = services.find(s => s.id === serviceId);
        return {
          id: serviceId,
          name: service?.name || 'Unknown Service',
          price: service?.price || 0
        };
      });

      // Create a single booking with all selected services
      const totalAmount = calculateTotal();
      const serviceNames = selectedServiceDetails.map(s => s.name).join(', ');
      
      const bookingData: any = {
        user_id: user.id,
        garage_id: garageId!,
        service_id: selectedServices[0], // Use first service as primary for backward compatibility
        booking_date: bookingDate,
        booking_time: selectedTimeSlot,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        vehicle_type: vehicleType,
        notes: `Services: ${serviceNames}\nService Type: ${serviceType === 'home_service' ? 'Home Service' : 'Pickup Service'}\nAddress: ${serviceAddress}${notes ? `\n\nAdditional Notes: ${notes}` : ''}`,
        payment_method: paymentMethod,
        total_amount: totalAmount,
        status: 'confirmed',
        service_details: selectedServiceDetails,
        service_names: serviceNames
      };

      // Only assign mechanic if one is available
      if (availableMechanic) {
        bookingData.assigned_mechanic_id = availableMechanic.id;
        bookingData.assigned_mechanic_name = availableMechanic.name;
        bookingData.assigned_at = new Date().toISOString();
      }

      // Insert the single booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Insert service associations into booking_services table
      const bookingServicePromises = selectedServices.map(serviceId => 
        supabase
          .from('booking_services')
          .insert({
            booking_id: booking.id,
            service_id: serviceId
          })
      );

      await Promise.all(bookingServicePromises);

      const mechanicMessage = availableMechanic 
        ? `Assigned mechanic: ${availableMechanic.name}`
        : 'Mechanic will be assigned by the garage owner';

      toast({
        title: "Booking Confirmed!",
        description: `Your ${serviceType === 'home_service' ? 'home service' : 'pickup'} booking for ${serviceNames} has been confirmed for ${bookingDate} at ${selectedTimeSlot}. ${mechanicMessage}`,
      });

      navigate('/profile');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!garage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 pb-20">
      <PageHeader title="Book Service" showBackButton />
      
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Hero Section with Garage Info */}
        <div className="relative">
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800">
            <CardContent className="p-0">
              <div className="relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 opacity-50" style={{
                  backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
                }}></div>
                
                <div className="relative p-8">
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                        <img 
                          src={garage.image_url || "/placeholder.svg"} 
                          alt={garage.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        VERIFIED
                      </div>
                    </div>
                    
                    <div className="flex-1 text-white">
                      <h1 className="text-3xl font-bold mb-2">{garage.name}</h1>
                      <div className="flex items-center space-x-2 mb-3">
                        <MapPin className="h-5 w-5 text-red-200" />
                        <p className="text-red-100 text-lg">{garage.location}</p>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center bg-yellow-500 px-3 py-1 rounded-full">
                            <Star className="h-4 w-4 text-white mr-1 fill-current" />
                            <span className="text-white font-bold text-sm">{garage.rating || 0}</span>
                          </div>
                          <span className="text-red-100 text-sm">({garage.total_reviews || 0} reviews)</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-red-100">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">Quick Service</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm">Trusted</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-red-50 border-b">
            <CardTitle className="text-2xl text-gray-900 flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-red-600" />
              Book Your Service
            </CardTitle>
            <p className="text-gray-600 mt-2">Select your preferred service and schedule</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Type Selection */}
              <div>
                <Label className="text-base font-semibold">Service Type</Label>
                <RadioGroup
                  value={serviceType}
                  onValueChange={(value: 'pickup' | 'home_service') => {
                    console.log('Service type changed to:', value);
                    setServiceType(value);
                  }}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <label htmlFor="pickup" className="text-sm font-medium cursor-pointer">
                        Pickup Service
                      </label>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">We'll pickup & deliver your vehicle</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="home_service" id="home_service" />
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-green-600" />
                      <label htmlFor="home_service" className="text-sm font-medium cursor-pointer">
                        Home Service
                      </label>
                    </div>
                    <span className="text-xs text-green-600 ml-auto">+₹49 service fee</span>
                  </div>
                </RadioGroup>
              </div>

              {/* Service Address */}
              <div>
                <Label htmlFor="address">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  {serviceType === 'home_service' ? 'Home Address' : 'Pickup Address'}
                </Label>
                <Textarea
                  id="address"
                  value={serviceAddress}
                  onChange={(e) => setServiceAddress(e.target.value)}
                  placeholder={`Enter your ${serviceType === 'home_service' ? 'home' : 'pickup'} address...`}
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please provide detailed address including landmarks for easy location
                </p>
              </div>

              {/* Services Selection */}
              <div>
                <Label className="text-base font-semibold">Select Services</Label>
                <div className="mt-2 space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={service.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {service.name}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm font-semibold text-green-600">
                            ₹{service.price}
                          </span>
                          <span className="text-xs text-gray-500">
                            {service.duration} minutes
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <Label htmlFor="date">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Booking Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => {
                    console.log('Date selected:', e.target.value);
                    setBookingDate(e.target.value);
                    setSelectedTimeSlot(''); // Reset time slot when date changes
                  }}
                  min={today}
                  required
                />
              </div>

              {/* Time Slot Selection */}
              <div>
                <Label htmlFor="time">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Available Time Slots
                </Label>
                {bookingDate ? (
                  <div className="mt-2">
                    {timeSlotsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading available time slots...</p>
                      </div>
                    ) : timeSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.id}
                            type="button"
                            variant={selectedTimeSlot === slot.start_time ? "default" : "outline"}
                            className="justify-start text-sm h-auto py-2 px-3"
                            onClick={() => {
                              console.log('Time slot selected:', slot.start_time);
                              setSelectedTimeSlot(slot.start_time);
                            }}
                          >
                            {formatTimeSlot(slot.start_time, slot.end_time)}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm font-medium">
                          No available time slots for this date
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Please try selecting a different date or contact the garage directly
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 border border-gray-200 rounded-lg bg-gray-50">
                    <Calendar className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Please select a date to see available time slots
                    </p>
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                
                <div>
                  <Label htmlFor="name">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vehicle Information</h3>
                
                <div>
                  <Label htmlFor="vehicle-type">Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="bike">Bike</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="make">
                    <Car className="w-4 h-4 inline mr-2" />
                    Vehicle Make
                  </Label>
                  <Input
                    id="make"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="e.g., Toyota, Honda, BMW"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="model">Vehicle Model</Label>
                  <Input
                    id="model"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g., Camry, Accord, X5"
                    required
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <Label htmlFor="notes">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or concerns..."
                  rows={3}
                />
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="payment">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total */}
              {selectedServices.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Services Total:</span>
                      <span className="text-sm font-medium">
                        ₹{selectedServices.reduce((total, serviceId) => {
                          const service = services.find(s => s.id === serviceId);
                          return total + (service?.price || 0);
                        }, 0)}
                      </span>
                    </div>
                    {serviceType === 'home_service' && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Home Service Fee:</span>
                        <span className="text-sm font-medium text-green-600">+₹49</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{calculateTotal()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || selectedServices.length === 0 || !selectedTimeSlot || !serviceAddress.trim()}
              >
                {isLoading ? "Booking..." : `Confirm ${serviceType === 'home_service' ? 'Home Service' : 'Pickup'} Booking`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;
