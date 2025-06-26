
import { useState } from 'react';
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

const BookingPage = () => {
  const { garageId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    garageName: 'AutoCare Hub', // This would be auto-filled based on garageId
    carBrand: '',
    carModel: '',
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

  const availableServices = [
    { id: 'oil-change', name: 'Oil Change', price: 1500 },
    { id: 'brake-service', name: 'Brake Service', price: 2500 },
    { id: 'ac-repair', name: 'AC Repair', price: 3000 },
    { id: 'car-wash', name: 'Car Wash', price: 500 },
    { id: 'tire-service', name: 'Tire Service', price: 2000 },
    { id: 'engine-diagnostic', name: 'Engine Diagnostic', price: 1000 }
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.carBrand || !formData.carModel || !formData.serviceDate || !formData.serviceTime || formData.services.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one service.",
        variant: "destructive"
      });
      return;
    }

    // Simulate booking creation
    const booking = {
      id: Date.now(),
      ...formData,
      totalCost: calculateTotal(),
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // In a real app, this would be stored in your database
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    localStorage.setItem('bookings', JSON.stringify([...existingBookings, booking]));

    toast({
      title: "Booking Confirmed!",
      description: `Your booking at ${formData.garageName} has been confirmed for ${formData.serviceDate}.`,
    });

    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              {/* Garage Info */}
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

              {/* Car Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Car Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="car-brand">Car Brand *</Label>
                      <Select value={formData.carBrand} onValueChange={(value) => setFormData({...formData, carBrand: value, carModel: ''})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {carBrands.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="car-model">Car Model *</Label>
                      <Select value={formData.carModel} onValueChange={(value) => setFormData({...formData, carModel: value})} disabled={!formData.carBrand}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.carBrand && carModels[formData.carBrand]?.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time */}
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

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Services *</CardTitle>
                </CardHeader>
                <CardContent>
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
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
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
                    {formData.carBrand && formData.carModel && (
                      <div className="flex justify-between text-sm">
                        <span>Vehicle:</span>
                        <span className="font-medium">{formData.carBrand} {formData.carModel}</span>
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

                  {/* Payment Options */}
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

                  <Button type="submit" className="w-full" size="lg">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Confirm Booking
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
