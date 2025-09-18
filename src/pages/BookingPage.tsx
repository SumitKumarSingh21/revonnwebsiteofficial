import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useMechanicAvailability } from '@/hooks/useMechanicAvailability';
import { useLocation } from '@/hooks/useLocation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, Car, FileText, MapPin, Home, Star, Shield, Award, Navigation, MessageCircle } from 'lucide-react';
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
  const {
    garageId
  } = useParams();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [serviceType, setServiceType] = useState<'pickup' | 'home_service'>('pickup');
  const [serviceAddress, setServiceAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    timeSlots,
    loading: timeSlotsLoading,
    formatTimeSlot
  } = useTimeSlots(garageId || '', bookingDate);
  const {
    getAvailableMechanicForSlot
  } = useMechanicAvailability(garageId || '', bookingDate);
  const { location, loading: locationLoading, getCurrentLocation } = useLocation();
  
  useEffect(() => {
    if (garageId) {
      fetchGarageAndServices();
    }
  }, [garageId]);

  // Auto-fill address when location is detected and service address is empty
  useEffect(() => {
    if (location && !serviceAddress) {
      setServiceAddress(location.address);
    }
  }, [location, serviceAddress]);
  const fetchGarageAndServices = async () => {
    if (!garageId) return;
    try {
      // Fetch garage details
      const {
        data: garageData,
        error: garageError
      } = await supabase.from('garages').select('*').eq('id', garageId).single();
      if (garageError) throw garageError;
      setGarage(garageData);

      // Fetch services
      const {
        data: servicesData,
        error: servicesError
      } = await supabase.from('services').select('*').eq('garage_id', garageId);
      if (servicesError) throw servicesError;
      setServices(servicesData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load garage information",
        variant: "destructive"
      });
    }
  };
  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]);
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
        variant: "destructive"
      });
      return;
    }
    if (selectedServices.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please select at least one service",
        variant: "destructive"
      });
      return;
    }
    if (!selectedTimeSlot) {
      toast({
        title: "No Time Selected",
        description: "Please select a time slot",
        variant: "destructive"
      });
      return;
    }
    if (!serviceAddress.trim()) {
      toast({
        title: "Address Required",
        description: `Please provide your address for ${serviceType === 'home_service' ? 'home service' : 'pickup service'}`,
        variant: "destructive"
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
      
      // Set payment status based on payment method
      const paymentStatus = paymentMethod === 'cash' ? 'cash_on_service' : 'pending';
      
      const bookingData: any = {
        user_id: user.id,
        garage_id: garageId!,
        service_id: selectedServices[0],
        // Use first service as primary for backward compatibility
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
        payment_status: paymentStatus,
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
      const {
        data: booking,
        error: bookingError
      } = await supabase.from('bookings').insert(bookingData).select().single();
      if (bookingError) throw bookingError;

      // Insert service associations into booking_services table
      const bookingServicePromises = selectedServices.map(serviceId => supabase.from('booking_services').insert({
        booking_id: booking.id,
        service_id: serviceId
      }));
      await Promise.all(bookingServicePromises);

      // Handle payment method
      if (paymentMethod === 'cash') {
        // Cash on Service - booking is confirmed immediately
        const mechanicMessage = availableMechanic ? `Assigned mechanic: ${availableMechanic.name}` : 'Mechanic will be assigned by the garage owner';
        toast({
          title: "Booking Confirmed!",
          description: `Your ${serviceType === 'home_service' ? 'home service' : 'pickup'} booking for ${serviceNames} has been confirmed for ${bookingDate} at ${selectedTimeSlot}. ${mechanicMessage}. Payment: Cash on Service.`
        });
        navigate('/profile');
      } else {
        // Online Payment - create payment link
        setIsProcessingPayment(true);
        
        try {
          const { data: paymentResponse, error: paymentError } = await supabase.functions.invoke('create-bulkpe-payment', {
            body: {
              bookingId: booking.id,
              amount: totalAmount,
              customerName: customerName,
              customerEmail: customerEmail,
              customerPhone: customerPhone
            }
          });

          if (paymentError || !paymentResponse.success) {
            throw new Error(paymentResponse?.error || 'Failed to create payment');
          }

          // Redirect to payment URL (validate first)
          const url = paymentResponse?.paymentUrl as string | undefined;
          if (!url || typeof url !== 'string' || !/^https?:\/\//.test(url)) {
            throw new Error('Invalid payment link returned from gateway');
          }
          window.location.href = url;
          
        } catch (paymentError: any) {
          console.error('Payment creation failed:', paymentError);
          toast({
            title: "Payment Failed",
            description: "Failed to create payment link. Please try again or choose Cash on Service.",
            variant: "destructive"
          });
          setIsProcessingPayment(false);
        }
      }
      
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  if (!garage) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>;
  }
  const today = new Date().toISOString().split('T')[0];
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Fixed Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="sm" onClick={() => navigate('/services')} className="mr-3 hover:bg-red-50 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3 flex-1">
              
              <div className="flex-1">
                <h1 className="text-xl font-bold text-red-600">Revonn</h1>
                
              </div>
              <div className="text-right">
                <h2 className="text-lg font-semibold text-gray-900">Book Service</h2>
                <p className="text-xs text-gray-500">Schedule your appointment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Hero Section with Garage Info */}
        <div className="relative">
          <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-red-600 via-red-700 to-rose-800 transform hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-0">
              <div className="relative">
                {/* Enhanced Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"80\" height=\"80\" viewBox=\"0 0 80 80\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.15\"%3E%3Cpath d=\"M0 0h40v40H0V0zm40 40h40v40H40V40z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
              }}></div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-yellow-400/20 rounded-full blur-lg"></div>
                
                <div className="relative p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                    <div className="relative group">
                      <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl group-hover:shadow-3xl transition-all duration-300 bg-white/10 backdrop-blur-sm">
                      <img 
                        src={garage.image_url || "/placeholder.svg"} 
                        alt={`${garage.name} - Professional auto repair and vehicle service center offering comprehensive car and bike servicing in ${garage.location}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      </div>
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs px-3 py-2 rounded-full font-bold shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-300">
                        ✓ VERIFIED
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/30">
                        Premium Partner
                      </div>
                    </div>
                    
                    <div className="flex-1 text-white space-y-4">
                      <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                          {garage.name}
                        </h1>
                        <div className="flex items-center space-x-3 mb-4">
                          <MapPin className="h-6 w-6 text-red-200" />
                          <p className="text-red-100 text-xl font-medium">{garage.location}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                          <div className="flex items-center space-x-3">
                            <div className="bg-yellow-500 p-2 rounded-xl shadow-lg">
                              <Star className="h-5 w-5 text-white fill-current" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold">{garage.rating || 0}</div>
                              <div className="text-red-100 text-sm">({garage.total_reviews || 0} reviews)</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 p-2 rounded-xl shadow-lg">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold">Quick Service</div>
                              <div className="text-red-100 text-sm">Professional Care</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 pt-2">
                        <div className="bg-green-500/20 text-green-100 px-4 py-2 rounded-full text-sm font-medium border border-green-500/30">
                          <Shield className="h-4 w-4 inline mr-1" />
                          Trusted Partner
                        </div>
                        <div className="bg-purple-500/20 text-purple-100 px-4 py-2 rounded-full text-sm font-medium border border-purple-500/30">
                          <Award className="h-4 w-4 inline mr-1" />
                          Certified Mechanics
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Booking Form */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 via-white to-red-50 border-b border-red-100 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-blue-500/5"></div>
            <div className="relative">
              <CardTitle className="text-3xl text-gray-900 flex items-center font-bold">
                <div className="bg-red-600 p-2 rounded-xl mr-4 shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                Book Your Service
              </CardTitle>
              <p className="text-gray-600 mt-3 text-lg">Select your preferred service and schedule your appointment</p>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Type Selection */}
              <div>
                <Label className="text-base font-semibold">Service Type</Label>
                <RadioGroup value={serviceType} onValueChange={(value: 'pickup' | 'home_service') => {
                console.log('Service type changed to:', value);
                setServiceType(value);
              }} className="mt-2">
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
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="address">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {serviceType === 'home_service' ? 'Home Address' : 'Pickup Address'}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const detectedLocation = await getCurrentLocation();
                      if (detectedLocation) {
                        setServiceAddress(detectedLocation.address);
                      }
                    }}
                    disabled={locationLoading}
                    className="text-xs"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    {locationLoading ? 'Detecting...' : 'Use Current Location'}
                  </Button>
                </div>
                <Textarea 
                  id="address" 
                  value={serviceAddress} 
                  onChange={e => setServiceAddress(e.target.value)} 
                  placeholder={`Enter your ${serviceType === 'home_service' ? 'home' : 'pickup'} address...`} 
                  rows={3} 
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please provide detailed address including landmarks for easy location
                  {location && (
                    <span className="text-green-600 ml-2">
                      ✓ Current location: {location.city}
                    </span>
                  )}
                </p>
              </div>

              {/* Services Selection */}
              <div>
                <Label className="text-base font-semibold">Select Services</Label>
                <div className="mt-2 space-y-3">
                  {services.map(service => <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox id={service.id} checked={selectedServices.includes(service.id)} onCheckedChange={() => handleServiceToggle(service.id)} />
                      <div className="flex-1">
                        <label htmlFor={service.id} className="text-sm font-medium cursor-pointer">
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
                    </div>)}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <Label htmlFor="date">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Booking Date
                </Label>
                <Input id="date" type="date" value={bookingDate} onChange={e => {
                console.log('Date selected:', e.target.value);
                setBookingDate(e.target.value);
                setSelectedTimeSlot(''); // Reset time slot when date changes
              }} min={today} required />
              </div>

              {/* Time Slot Selection */}
              <div>
                <Label htmlFor="time">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Available Time Slots
                </Label>
                {bookingDate ? (
                  <div className="mt-3">
                    {timeSlotsLoading ? (
                      <div className="text-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-3">Loading available time slots...</p>
                      </div>
                    ) : timeSlots.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm text-green-600 font-medium">
                          ✓ {timeSlots.length} time slots available
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {timeSlots.map(slot => (
                            <Button
                              key={slot.id}
                              type="button"
                              variant={selectedTimeSlot === slot.start_time ? "default" : "outline"}
                              className={`justify-center text-sm h-12 py-3 px-4 transition-all duration-200 font-medium ${
                                selectedTimeSlot === slot.start_time 
                                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg scale-105" 
                                  : "hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                              }`}
                              onClick={() => {
                                console.log('Time slot selected:', slot.start_time);
                                setSelectedTimeSlot(slot.start_time);
                              }}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              {formatTimeSlot(slot.start_time, slot.end_time)}
                            </Button>
                          ))}
                        </div>
                        {selectedTimeSlot && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700 font-medium">
                              ✓ Selected: {formatTimeSlot(selectedTimeSlot, timeSlots.find(s => s.start_time === selectedTimeSlot)?.end_time || '')}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 text-base font-medium mb-2">
                          No available time slots for this date
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          This might be because all slots are booked or it's a holiday.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setBookingDate('')}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Choose Different Date
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 mt-3">
                    <Calendar className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                    <p className="text-gray-700 text-base font-medium">
                      Please select a date to see available time slots
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      We'll show you all available appointment times
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
                  <Input id="name" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input id="email" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input id="phone" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
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
                  <Input id="make" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} placeholder="e.g., Toyota, Honda, BMW" required />
                </div>

                <div>
                  <Label htmlFor="model">Vehicle Model</Label>
                  <Input id="model" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} placeholder="e.g., Camry, Accord, X5" required />
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <Label htmlFor="notes">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Additional Notes (Optional)
                </Label>
                <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions or concerns..." rows={3} />
              </div>

              {/* Payment Options */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <RadioGroupItem value="cash" id="cash" />
                    <div className="flex-1">
                      <label htmlFor="cash" className="text-sm font-medium cursor-pointer flex items-center">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold">Cash on Service</div>
                          <div className="text-xs text-gray-500">Pay directly to the garage at service time</div>
                        </div>
                      </label>
                    </div>
                    <div className="text-green-600 font-medium text-sm">No extra charges</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <RadioGroupItem value="online" id="online" />
                    <div className="flex-1">
                      <label htmlFor="online" className="text-sm font-medium cursor-pointer flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold">UPI/Online Payment</div>
                          <div className="text-xs text-gray-500">Pay now via UPI, Cards, Net Banking (Powered by Bulkpe)</div>
                        </div>
                      </label>
                    </div>
                    <div className="text-blue-600 font-medium text-sm">Secure & Instant</div>
                  </div>
                </RadioGroup>
              </div>

              {/* Total */}
              {selectedServices.length > 0 && <div className="bg-gray-50 p-4 rounded-lg">
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
                    {serviceType === 'home_service' && <div className="flex justify-between items-center">
                        <span className="text-sm">Home Service Fee:</span>
                        <span className="text-sm font-medium text-green-600">+₹49</span>
                      </div>}
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{calculateTotal()}
                      </span>
                    </div>
                  </div>
                </div>}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isProcessingPayment || selectedServices.length === 0 || !selectedTimeSlot || !serviceAddress.trim()}
              >
                {isProcessingPayment 
                  ? "Redirecting to Payment..." 
                  : isLoading 
                    ? "Booking..." 
                    : paymentMethod === 'cash'
                      ? `Confirm ${serviceType === 'home_service' ? 'Home Service' : 'Pickup'} Booking`
                      : `Pay ₹${calculateTotal()} & Confirm Booking`
                }
              </Button>
              
              {paymentMethod === 'online' && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 text-center">
                    🔒 You'll be redirected to a secure payment page powered by Bulkpe
                  </p>
                </div>
              )}

              {/* Support Link */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Need help with your booking?</p>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/support/create-ticket?booking_id=${garageId}`)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Get Support
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default BookingPage;