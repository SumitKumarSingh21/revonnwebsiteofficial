
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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { location, loading: locationLoading, getCurrentLocation } = useLocation();

  useEffect(() => {
    fetchGarages();
  }, []);

  const fetchGarages = async () => {
    try {
      const { data, error } = await supabase
        .from('garages')
        .select('*')
        .eq('status', 'active')
        .order('rating', { ascending: false });

      if (error) throw error;
      setGarages(data || []);
    } catch (error) {
      console.error('Error fetching garages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGarages = garages.filter(garage =>
    garage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    garage.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    garage.services?.some(service => 
      service.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const featuredServices = [
    { name: 'General Service', icon: '🔧', color: 'bg-blue-500' },
    { name: 'Oil Change', icon: '🛢️', color: 'bg-green-500' },
    { name: 'Brake Service', icon: '🛑', color: 'bg-red-500' },
    { name: 'AC Repair', icon: '❄️', color: 'bg-cyan-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/5917b996-fa5e-424e-929c-45aab08219a5.png" 
                alt="Revonn Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10" 
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-red-600">Revonn</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Beyond Class</p>
              </div>
            </div>
            
            {/* Location Display - Enhanced for Mobile */}
            <div className="flex items-center space-x-2 text-right min-w-0">
              {locationLoading ? (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-red-600 border-t-transparent flex-shrink-0"></div>
                  <span className="text-xs text-gray-500 hidden sm:inline">Detecting...</span>
                </div>
              ) : location ? (
                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                  <div className="text-right min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[80px] sm:max-w-[200px]">
                      {location.city}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block truncate max-w-[200px]">
                      {location.address}
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  className="text-xs sm:text-sm border-red-300 text-red-600 hover:bg-red-50 px-2 sm:px-3"
                >
                  <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Detect Location</span>
                  <span className="sm:hidden">Location</span>
                </Button>
              )}
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
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for services, garages, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg rounded-2xl border-2 border-gray-200 focus:border-red-500 shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
              <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{garages.length}+</div>
            <div className="text-xs sm:text-sm text-gray-600">Trusted Garages</div>
          </div>
          
          <div className="text-center p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">10K+</div>
            <div className="text-xs sm:text-sm text-gray-600">Happy Customers</div>
          </div>
          
          <div className="text-center p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full mb-3 sm:mb-4">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 fill-current" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">4.8</div>
            <div className="text-xs sm:text-sm text-gray-600">Average Rating</div>
          </div>
          
          <div className="text-center p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full mb-3 sm:mb-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">100%</div>
            <div className="text-xs sm:text-sm text-gray-600">Verified</div>
          </div>
        </div>

        {/* Featured Services */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Popular Services</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featuredServices.map((service, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg">
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

        {/* Garages Section - Limited to 6 garages */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {searchTerm ? 'Search Results' : 'Top Rated Garages'}
            </h3>
            {filteredGarages.length > 0 && !searchTerm && (
              <Button variant="outline" onClick={() => navigate('/services')} className="hidden sm:flex">
                View All <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="animate-pulse">
                    <div className="h-48 sm:h-56 bg-gray-200"></div>
                    <CardContent className="p-4 sm:p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredGarages.length === 0 ? (
            <Card className="text-center py-12 sm:py-16">
              <CardContent>
                <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No garages found' : 'No garages available'}
                </h4>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? `Try searching with different keywords or check your spelling.`
                    : 'Check back later for available garages in your area.'
                  }
                </p>
                {searchTerm && (
                  <Button onClick={() => setSearchTerm('')} variant="outline">
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Show only 6 garages on homepage when not searching, all when searching */}
              {(searchTerm ? filteredGarages : filteredGarages.slice(0, 6)).map((garage) => (
                <Card key={garage.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg group">
                  <div className="relative">
                    <img 
                      src={garage.image_url || "/placeholder.svg"} 
                      alt={garage.name}
                      className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <Badge className="bg-white/90 text-green-700 border-green-200 shadow-lg">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {garage.rating || 0}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <h4 className="font-bold text-lg sm:text-xl text-gray-900 mb-1 line-clamp-1">
                          {garage.name}
                        </h4>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="line-clamp-1">{garage.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Quick Service</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {garage.total_reviews || 0} reviews
                        </div>
                      </div>
                      
                      <Button 
                        asChild 
                        className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
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
          
          {/* Show "View All" button only when not searching and there are more than 6 garages */}
          {!searchTerm && filteredGarages.length > 6 && (
            <div className="text-center pt-4">
              <Button onClick={() => navigate('/services')} size="lg" className="bg-red-600 hover:bg-red-700">
                View All Garages
              </Button>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;
