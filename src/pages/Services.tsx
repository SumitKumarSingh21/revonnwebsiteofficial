

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Search, Filter, ArrowLeft, Car, Bike } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';

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
  }, []);

  const fetchGarages = async () => {
    try {
      const { data, error } = await supabase
        .from('garages')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setGarages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load garages",
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
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <PageHeader 
        title="Vehicle Services" 
        backTo="/"
      />

      {/* Service Type Selection */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-2">
            <Button
              variant={serviceType === 'all' ? 'default' : 'outline'}
              onClick={() => setServiceType('all')}
              className={serviceType === 'all' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              All Services
            </Button>
            <Button
              variant={serviceType === 'car' ? 'default' : 'outline'}
              onClick={() => setServiceType('car')}
              className={serviceType === 'car' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <Car className="h-4 w-4 mr-2" />
              Car Services
            </Button>
            <Button
              variant={serviceType === 'bike' ? 'default' : 'outline'}
              onClick={() => setServiceType('bike')}
              className={serviceType === 'bike' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <Bike className="h-4 w-4 mr-2" />
              Bike Services
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search services or garages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Available Garages */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Service Centers</h2>
          <div className="flex items-center text-red-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">Near you</span>
          </div>
        </div>

        {filteredGarages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGarages.map((garage) => (
              <Card key={garage.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-video bg-gradient-to-r from-red-100 to-red-200 rounded-t-lg flex items-center justify-center">
                  {garage.image_url ? (
                    <img src={garage.image_url} alt={garage.name} className="w-full h-full object-cover rounded-t-lg" />
                  ) : (
                    <div className="text-4xl">🏢</div>
                  )}
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg group-hover:text-red-600 transition-colors">
                        {garage.name}
                      </CardTitle>
                      <div className="flex items-center mt-1 text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{garage.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                      <span className="text-sm font-medium">{garage.average_rating || garage.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {garage.services?.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {garage.services && garage.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{garage.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        <span className="font-semibold text-green-600">{garage.total_reviews || 0} reviews</span>
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/book/${garage.id}`)}
                        className="group-hover:bg-red-600 hover:bg-red-700 bg-red-600 transition-colors"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No service centers found</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? "Try adjusting your search terms or filters." 
                : "No service centers are available in your area at the moment."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
