import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const CallRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [reason, setReason] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCustomerName(data.full_name || '');
        setCustomerPhone(data.phone || '');
      }
      setCustomerEmail(user.email || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's slots (only if it's before 6 PM)
    if (today.getHours() < 18) {
      slots.push({
        value: 'today-morning',
        label: 'Today - Morning (10 AM - 12 PM)',
        datetime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0)
      });
      slots.push({
        value: 'today-afternoon',
        label: 'Today - Afternoon (2 PM - 5 PM)',
        datetime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0)
      });
    }

    // Tomorrow's slots
    slots.push({
      value: 'tomorrow-morning',
      label: 'Tomorrow - Morning (10 AM - 12 PM)',
      datetime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0)
    });
    slots.push({
      value: 'tomorrow-afternoon',
      label: 'Tomorrow - Afternoon (2 PM - 5 PM)',
      datetime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0)
    });
    slots.push({
      value: 'tomorrow-evening',
      label: 'Tomorrow - Evening (5 PM - 7 PM)',
      datetime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 17, 0)
    });

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !reason.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTimeSlot) {
      toast({
        title: "Time slot required",
        description: "Please select a preferred time slot.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedSlot = timeSlots.find(slot => slot.value === selectedTimeSlot);
      
      const { error } = await supabase
        .from('call_requests')
        .insert({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim() || null,
          reason: reason.trim(),
          preferred_time: selectedSlot?.datetime.toISOString(),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Call request submitted!",
        description: "We'll call you during your preferred time slot. You'll receive a confirmation shortly.",
      });

      navigate('/support');
    } catch (error: any) {
      console.error('Error creating call request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit call request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/support')} 
              className="mr-3 hover:bg-green-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-xl shadow-lg">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Request a Call</h1>
                <p className="text-sm text-gray-500">Schedule a callback from our team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-600" />
              <span>Schedule Your Call</span>
            </CardTitle>
            <p className="text-gray-600">
              Our support team will call you during your preferred time slot.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Contact Information</h3>
                
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll call you on this number
                  </p>
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="For call confirmation"
                  />
                </div>
              </div>

              {/* Call Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Call Details</h3>
                
                <div>
                  <Label htmlFor="reason">Reason for Call *</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Brief description of what you need help with..."
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Time Preference */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Preferred Time Slot *</span>
                </h3>
                
                <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                  {timeSlots.map((slot) => (
                    <div key={slot.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={slot.value} id={slot.value} />
                      <label htmlFor={slot.value} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{slot.label}</span>
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                      </label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Call Schedule Information:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Calls typically last 5-15 minutes</li>
                        <li>• You'll receive an SMS confirmation</li>
                        <li>• If we miss you, we'll try calling again within the time slot</li>
                        <li>• You can also call us back anytime at +91-XXXXX-XXXXX</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/support')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                  {loading ? 'Requesting...' : 'Request Call'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CallRequest;