import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Search, Filter, ArrowLeft, Car, Bike, Clock, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import FilterModal from '@/components/FilterModal';
interface Garage {
  id: string;
  name: string;
  location: string;
  rating: number;
  services: string[];
  image_url?: string;
  average_rating: number;
  total_reviews: number;
  min_price?: number;
}
const Services = () => {
  const navigate = useNavigate();
  const [garages, setGarages] = useState<Garage[]>([]);
  const [filteredGarages, setFilteredGarages] = useState<Garage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState<'all' | 'car' | 'bike'>('all');
  const [loading, setLoading] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  useEffect(() => {
    fetchGarages();

    // Set up real-time subscription with improved error handling
    const channel = supabase.channel('garages-realtime').on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'garages'
    }, payload => {
      console.log('Garage deleted in real-time:', payload.old);
      setGarages(prev => {
        const filtered = prev.filter(garage => garage.id !== payload.old.id);
        console.log('Updated garage list after deletion:', filtered.length);
        return filtered;
      });
      toast({
        title: "Garage Removed",
        description: "A garage has been removed and is no longer available",
        variant: "default"
      });
    }).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'garages'
    }, payload => {
      console.log('New garage added:', payload.new);
      setGarages(prev => [payload.new as Garage, ...prev]);
      toast({
        title: "New Garage Added",
        description: "A new garage is now available for bookings"
      });
    }).on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'garages'
    }, payload => {
      console.log('Garage updated:', payload.new);
      setGarages(prev => prev.map(garage => garage.id === payload.new.id ? payload.new as Garage : garage));
    }).subscribe(status => {
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

      // Fetch garages with their minimum service prices
      const {
        data: garagesData,
        error: garagesError
      } = await supabase.from('garages').select('*').order('rating', {
        ascending: false
      });
      if (garagesError) throw garagesError;

      // Fetch minimum prices for each garage
      const garagesWithPrices = await Promise.all((garagesData || []).map(async garage => {
        const {
          data: services
        } = await supabase.from('services').select('price').eq('garage_id', garage.id).not('price', 'is', null).order('price', {
          ascending: true
        }).limit(1);
        return {
          ...garage,
          min_price: services && services.length > 0 ? services[0].price : null
        };
      }));
      console.log('Fetched garages:', garagesWithPrices.length);
      setGarages(garagesWithPrices);
      setFilteredGarages(garagesWithPrices);
    } catch (error: any) {
      console.error('Failed to load garages:', error);
      toast({
        title: "Error",
        description: "Failed to load garages. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  // Apply search and filters
  useEffect(() => {
    let filtered = garages.filter(garage => {
      const matchesSearch = garage.name.toLowerCase().includes(searchQuery.toLowerCase()) || garage.location.toLowerCase().includes(searchQuery.toLowerCase()) || garage.services?.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));
      if (serviceType === 'all') return matchesSearch;
      const serviceTypeMatch = garage.services?.some(service => {
        if (serviceType === 'car') {
          return service.toLowerCase().includes('car') || service.toLowerCase().includes('auto') || service.toLowerCase().includes('vehicle');
        } else if (serviceType === 'bike') {
          return service.toLowerCase().includes('bike') || service.toLowerCase().includes('motorcycle') || service.toLowerCase().includes('scooter');
        }
        return false;
      });
      return matchesSearch && serviceTypeMatch;
    });

    // Apply advanced filters if any
    if (appliedFilters) {
      filtered = filtered.filter(garage => {
        // Price range filter
        if (garage.min_price && (garage.min_price < appliedFilters.priceRange[0] || garage.min_price > appliedFilters.priceRange[1])) {
          return false;
        }

        // Rating filter
        if (appliedFilters.rating > 0 && (garage.average_rating || garage.rating) < appliedFilters.rating) {
          return false;
        }

        // Services filter
        if (appliedFilters.services.length > 0) {
          const hasMatchingService = appliedFilters.services.some((filterService: string) => garage.services?.some(garageService => garageService.toLowerCase().includes(filterService.toLowerCase())));
          if (!hasMatchingService) return false;
        }

        // Vehicle type filter
        if (appliedFilters.vehicleType !== 'all') {
          const hasVehicleType = garage.services?.some(service => {
            const serviceLower = service.toLowerCase();
            if (appliedFilters.vehicleType === 'car') {
              return serviceLower.includes('car') || serviceLower.includes('auto') || serviceLower.includes('vehicle');
            } else if (appliedFilters.vehicleType === 'bike') {
              return serviceLower.includes('bike') || serviceLower.includes('motorcycle') || serviceLower.includes('scooter');
            } else if (appliedFilters.vehicleType === 'truck') {
              return serviceLower.includes('truck') || serviceLower.includes('heavy');
            }
            return false;
          });
          if (!hasVehicleType) return false;
        }
        return true;
      });

      // Apply sorting
      if (appliedFilters.sortBy === 'price_low') {
        filtered.sort((a, b) => (a.min_price || 999999) - (b.min_price || 999999));
      } else if (appliedFilters.sortBy === 'price_high') {
        filtered.sort((a, b) => (b.min_price || 0) - (a.min_price || 0));
      } else if (appliedFilters.sortBy === 'reviews') {
        filtered.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0));
      } else {
        // Default: rating
        filtered.sort((a, b) => (b.average_rating || b.rating || 0) - (a.average_rating || a.rating || 0));
      }
    }
    setFilteredGarages(filtered);
  }, [garages, searchQuery, serviceType, appliedFilters]);
  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
  };
  const handleClearFilters = () => {
    setAppliedFilters(null);
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 pb-20 md:pb-0">
      {/* Enhanced Fixed Header */}
      <div className="bg-white/98 backdrop-blur-md shadow-lg border-b border-red-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <Button variant="ghost" size="sm" asChild className="mr-3 hover:bg-red-50 hover:scale-105 transition-all duration-200">
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-4 flex-1">
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Revonn
                </h1>
                
              </div>
              <div className="text-right bg-gradient-to-r from-red-50 to-blue-50 px-4 py-3 rounded-2xl border border-red-100">
                <h1 className="text-xl font-bold text-gray-900">Find Auto Garages Near You</h1>
                <p className="text-xs text-gray-600">Car & Bike Service Centers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Type Selection */}
      

      {/* Search and Filter */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-red-100 sticky top-16 z-30 py-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input type="text" placeholder="Search by garage name, location, or service..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-12 border-red-200 focus:border-red-500 focus:ring-red-500" />
            </div>
            <FilterModal onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters} />
          </div>
        </div>
      </div>

      {/* Available Garages */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[17px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Best Auto Repair Shops & Vehicle Service Centers Near You</h2>
            <p className="text-gray-600">Verified mechanics and <strong>trusted garage booking</strong> for car & bike servicing</p>
          </div>
          <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-full">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Near you</span>
          </div>
        </div>

        {filteredGarages.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredGarages.map(garage => <Card key={garage.id} className="overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group border-0 bg-white/90 backdrop-blur-md rounded-3xl">
                <div className="relative">
                  <div className="aspect-[16/9] bg-gradient-to-br from-red-100 via-red-200 to-orange-200 flex items-center justify-center relative overflow-hidden">
                    {garage.image_url ? <img src={garage.image_url || "/placeholder.svg"} alt={`${garage.name} - Auto service center and garage in ${garage.location} for car and bike repairs`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="text-6xl opacity-60 group-hover:scale-110 transition-transform duration-500">🏢</div>}
                    {/* Enhanced overlay gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/20 transition-all duration-300"></div>
                    
                    {/* Floating rating badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center shadow-2xl border border-white/50 group-hover:scale-110 transition-transform duration-300">
                      <Star className="h-5 w-5 text-yellow-500 mr-2 fill-current drop-shadow-sm" />
                      <span className="text-sm font-bold text-gray-900">{(garage.average_rating || garage.rating)?.toFixed(1)}</span>
                    </div>
                    
                    {/* Premium verified badge */}
                    <div className="absolute bottom-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                      <span className="text-sm font-bold flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        VERIFIED
                      </span>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-6 left-6 w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="absolute top-10 left-8 w-2 h-2 bg-white/20 rounded-full"></div>
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
                    {garage.services?.slice(0, 3).map((service, index) => <Badge key={index} variant="secondary" className="text-xs bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
                        {service}
                      </Badge>)}
                    {garage.services && garage.services.length > 3 && <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                        +{garage.services.length - 3} more
                      </Badge>}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Starting from </span>
                      <span className="font-bold text-green-600 text-lg">
                        {garage.min_price ? `₹${garage.min_price}` : 'Contact for pricing'}
                      </span>
                    </div>
                    <Button size="lg" onClick={() => navigate(`/book/${garage.id}`)} className="group-hover:shadow-lg transition-all duration-300 bg-red-600 hover:bg-red-700 px-8">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div> : <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <div className="text-4xl">🔍</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No service centers found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery ? "Try adjusting your search terms or filters to find the perfect garage for your needs." : "No service centers are available in your area at the moment. Please check back later."}
            </p>
            <Button variant="outline" className="mt-6" onClick={() => {
          setSearchQuery('');
          setServiceType('all');
          handleClearFilters();
        }}>
              Clear Filters
            </Button>
          </div>}
      </div>
    </div>;
};
export default Services;