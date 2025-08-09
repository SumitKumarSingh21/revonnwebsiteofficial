import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, Star, Clock, Shield, Users, Wrench, Navigation, ChevronRight } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import BottomNavigation from '@/components/BottomNavigation';
interface Garage {
  id: string;
  name: string;
  location: string;
  image_url: string;
  rating: number;
  total_reviews: number;
  services: string[];
}
const Index = () => {
  const [garages, setGarages] = useState<Garage[]>([]);
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {
    location,
    loading: locationLoading,
    getCurrentLocation
  } = useLocation();
  useEffect(() => {
    fetchGarages();
  }, []);
  const fetchGarages = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('garages').select('*').eq('status', 'active').order('rating', {
        ascending: false
      });
      if (error) throw error;
      setGarages(data || []);
    } catch (error) {
      console.error('Error fetching garages:', error);
    } finally {
      setLoading(false);
    }
  };
  const featuredServices = [{
    name: 'General Service',
    icon: '🔧',
    color: 'bg-blue-500'
  }, {
    name: 'Oil Change',
    icon: '🛢️',
    color: 'bg-green-500'
  }, {
    name: 'Brake Service',
    icon: '🛑',
    color: 'bg-red-500'
  }, {
    name: 'AC Repair',
    icon: '❄️',
    color: 'bg-cyan-500'
  }, {
    name: 'Air Filter Change',
    icon: '💨',
    color: 'bg-red-500'
  }, {
    name: 'Battery Issue',
    icon: '🔋',
    color: 'bg-red-500'
  }];
  return <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-red-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src="/lovable-uploads/5917b996-fa5e-424e-929c-45aab08219a5.png" alt="Revonn Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-red-600">Revonn</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Beyond Class</p>
              </div>
            </div>
            
            {/* Location Display - Enhanced for Mobile */}
            <div className="flex items-center space-x-2 text-right min-w-0">
              {locationLoading ? <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-red-600 border-t-transparent flex-shrink-0"></div>
                  <span className="text-xs text-gray-500 hidden sm:inline">Detecting...</span>
                </div> : location ? <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                  <div className="text-right min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[80px] sm:max-w-[200px]">
                      {location.city}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block truncate max-w-[200px]">
                      {location.address}
                    </p>
                  </div>
                </div> : <Button variant="outline" size="sm" onClick={getCurrentLocation} className="text-xs sm:text-sm border-red-300 text-red-600 hover:bg-red-50 px-2 sm:px-3">
                  <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Detect Location</span>
                  <span className="sm:hidden">Location</span>
                </Button>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24">
        {/* Hero Section */}
        <div className="text-center space-y-4 sm:space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            Find the Best <span className="text-red-600">Auto Services</span> Near You
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with trusted mechanics and garages in your area. Quality service, fair prices, guaranteed satisfaction.
          </p>
          
          {/* Search Bar */}
          
        </div>

        {/* Quick Stats */}
        

        {/* Featured Services */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Popular Services</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featuredServices.map((service, index) => (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:scale-105"
                onClick={() => navigate('/services')}
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${service.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white text-xl sm:text-2xl`}>
                    {service.icon}
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900">{service.name}</h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Top Rated Garages Section - Horizontal scroll with 4 garages */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Top Rated Garages</h3>
            <Button variant="outline" onClick={() => navigate('/services')} className="flex items-center text-red-600 border-red-200 hover:bg-red-50">
              View All <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="flex-shrink-0 w-72 overflow-hidden">
                  <div className="animate-pulse">
                    <div className="h-40 bg-gray-200"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : garages.length === 0 ? (
            <Card className="text-center py-12 bg-red-50 border-red-100">
              <CardContent>
                <Wrench className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No garages available</h4>
                <p className="text-gray-600">Check back later for available garages in your area.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {garages.slice(0, 4).map((garage) => (
                <Card key={garage.id} className="flex-shrink-0 w-72 overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg group bg-white">
                  <div className="relative">
                    <img 
                      src={garage.image_url || "/placeholder.svg"} 
                      alt={garage.name} 
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-green-700 border-green-200 shadow-lg">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {garage.rating || 0}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                          {garage.name}
                        </h4>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="line-clamp-1">{garage.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Quick Service</span>
                        </div>
                        <div className="text-gray-500">
                          {garage.total_reviews || 0} reviews
                        </div>
                      </div>
                      
                      <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                        <Link to={`/booking/${garage.id}`}>
                          Book Service
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>;
};
export default Index;