import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Search, Filter, ArrowLeft, Car, Bike, Clock, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Garage {
  id: string;
  name: string;
  location: string;
  rating: number;
  services: string[];
  image_url?: string;
  average_rating: number;
  total_reviews: number;
}

const Services = () => {
  const navigate = useNavigate();
  const [garages, setGarages] = useState<Garage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState<'all' | 'car' | 'bike'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGarages();
    
    // Set up real-time subscription with improved error handling
    const channel = supabase
      .channel('garages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'garages'
        },
        (payload) => {
          console.log('Garage deleted in real-time:', payload.old);
          setGarages(prev => {
            const filtered = prev.filter(garage => garage.id !== payload.old.id);
            console.log('Updated garage list after deletion:', filtered.length);
            return filtered;
          });
          
          toast({
            title: "Garage Removed",
            description: "A garage has been removed and is no longer available",
            variant: "default",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'garages'
        },
        (payload) => {
          console.log('New garage added:', payload.new);
          setGarages(prev => [payload.new as Garage, ...prev]);
          
          toast({
            title: "New Garage Added",
            description: "A new garage is now available for bookings",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'garages'
        },
        (payload) => {
          console.log('Garage updated:', payload.new);
          setGarages(prev => 
            prev.map(garage => 
              garage.id === payload.new.id ? payload.new as Garage : garage
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to garage changes');
        }
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchGarages = async () => {
    try {
      console.log('Fetching garages...');
      const { data, error } = await supabase
        .from('garages')
        .select('*')
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error fetching garages:', error);
        throw error;
      }
      
      console.log('Fetched garages:', data?.length || 0);
      setGarages(data || []);
    } catch (error: any) {
      console.error('Failed to load garages:', error);
      toast({
        title: "Error",
        description: "Failed to load garages. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGarages = garages.filter(garage => {
    const matchesSearch = garage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      garage.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      garage.services?.some(service => 
        service.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    if (serviceType === 'all') return matchesSearch;
    
    const serviceTypeMatch = garage.services?.some(service => {
      if (serviceType === 'car') {
        return service.toLowerCase().includes('car') || 
               service.toLowerCase().includes('auto') ||
               service.toLowerCase().includes('vehicle');
      } else if (serviceType === 'bike') {
        return service.toLowerCase().includes('bike') || 
               service.toLowerCase().includes('motorcycle') ||
               service.toLowerCase().includes('scooter');
      }
      return false;
    });
    
    return matchesSearch && serviceTypeMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 pb-20 md:pb-0">
      {/* Fixed Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="sm" asChild className="mr-2 hover:bg-red-50">
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3 flex-1">
              <img src="/lovable-uploads/aaae1da6-0e09-46c6-8523-ec04acbc268d.png" alt="Revonn Logo" className="h-10 w-10" />
              <div className="flex-1">
                <h1 className="text-xl font-bold text-red-600">Revonn</h1>
                <p className="text-xs text-gray-500">Beyond Class</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-semibold text-gray-900">Vehicle Services</h2>
                <p className="text-xs text-gray-500">Find trusted garages</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Type Selection */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-red-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Service Type</h3>
            <p className="text-sm text-gray-600">Select the vehicle type for personalized recommendations</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={serviceType === 'all' ? 'default' : 'outline'}
              onClick={() => setServiceType('all')}
              className={`w-full text-sm py-6 flex flex-col items-center space-y-2 ${
                serviceType === 'all' 
                  ? 'bg-red-600 hover:bg-red-700 shadow-lg' 
                  : 'hover:bg-red-50 hover:border-red-200'
              }`}
            >
              <div className="flex items-center space-x-1">
                <Car className="h-4 w-4" />
                <Bike className="h-4 w-4" />
              </div>
              <span>All Services</span>
            </Button>
            <Button
              variant={serviceType === 'car' ? 'default' : 'outline'}
              onClick={() => setServiceType('car')}
              className={`w-full text-sm py-6 flex flex-col items-center space-y-2 ${
                serviceType === 'car' 
                  ? 'bg-red-600 hover:bg-red-700 shadow-lg' 
                  : 'hover:bg-red-50 hover:border-red-200'
              }`}
            >
              <Car className="h-5 w-5" />
              <span>Car Services</span>
            </Button>
            <Button
              variant={serviceType === 'bike' ? 'default' : 'outline'}
              onClick={() => setServiceType('bike')}
              className={`w-full text-sm py-6 flex flex-col items-center space-y-2 ${
                serviceType === 'bike' 
                  ? 'bg-red-600 hover:bg-red-700 shadow-lg' 
                  : 'hover:bg-red-50 hover:border-red-200'
              }`}
            >
              <Bike className="h-5 w-5" />
              <span>Bike Services</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-red-100 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by garage name, location, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-red-200 focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <Button variant="outline" size="lg" className="px-6 border-red-200 hover:bg-red-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Available Garages */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Service Centers</h2>
            <p className="text-gray-600">Trusted professionals ready to serve you</p>
          </div>
          <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-full">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Near you</span>
          </div>
        </div>

        {filteredGarages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGarages.map((garage) => (
              <Card key={garage.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-white/80 backdrop-blur-sm">
                <div className="relative">
                  <div className="aspect-[16/9] bg-gradient-to-br from-red-100 via-red-200 to-orange-200 flex items-center justify-center relative overflow-hidden">
                    {garage.image_url ? (
                      <img src={garage.image_url} alt={garage.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="text-6xl opacity-60">🏢</div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center shadow-lg">
                      <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                      <span className="text-sm font-semibold">{garage.average_rating || garage.rating}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full">
                      <span className="text-xs font-medium">VERIFIED</span>
                    </div>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="space-y-3">
                    <div>
                      <CardTitle className="text-xl group-hover:text-red-600 transition-colors mb-2">
                        {garage.name}
                      </CardTitle>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-4 w-4 mr-2 text-red-500" />
                        <span className="text-sm">{garage.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-1 text-green-500" />
                        <span>Verified</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-blue-500" />
                        <span>Quick Service</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-1 text-purple-500" />
                        <span>{garage.total_reviews || 0} reviews</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {garage.services?.slice(0, 3).map((service, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      >
                        {service}
                      </Badge>
                    ))}
                    {garage.services && garage.services.length > 3 && (
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                        +{garage.services.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Starting from </span>
                      <span className="font-bold text-green-600 text-lg">₹299</span>
                    </div>
                    <Button 
                      size="lg" 
                      onClick={() => navigate(`/book/${garage.id}`)}
                      className="group-hover:shadow-lg transition-all duration-300 bg-red-600 hover:bg-red-700 px-8"
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <div className="text-4xl">🔍</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No service centers found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery 
                ? "Try adjusting your search terms or filters to find the perfect garage for your needs." 
                : "No service centers are available in your area at the moment. Please check back later."
              }
            </p>
            <Button 
              variant="outline" 
              className="mt-6" 
              onClick={() => {
                setSearchQuery('');
                setServiceType('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
