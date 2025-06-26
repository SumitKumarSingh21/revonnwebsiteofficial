
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, ChevronRight, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Garage {
  id: string;
  name: string;
  location: string;
  average_rating: number;
  total_reviews: number;
  services: string[];
  image_url?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  garage_id: string;
  category: string;
}

const Services = () => {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreNearby, setShowMoreNearby] = useState(false);

  useEffect(() => {
    fetchGaragesAndServices();
  }, []);

  const fetchGaragesAndServices = async () => {
    try {
      setLoading(true);
      
      // Fetch garages
      const { data: garagesData, error: garagesError } = await supabase
        .from('garages')
        .select('*')
        .eq('status', 'active')
        .order('average_rating', { ascending: false });

      if (garagesError) throw garagesError;

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (servicesError) throw servicesError;

      setGarages(garagesData || []);
      setServices(servicesData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load garages and services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGarages = garages.filter(garage =>
    garage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    garage.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (garage.services && garage.services.some(service => 
      service.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  const displayedGarages = showMoreNearby ? filteredGarages : filteredGarages.slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Car Services</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search services or garages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {searchQuery ? (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Search Results ({filteredGarages.length})
            </h2>
            {filteredGarages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No garages found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGarages.map((garage) => (
                  <GarageCard key={garage.id} garage={garage} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Garages</h2>
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            
            {garages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No garages available at the moment.</p>
                <p className="text-sm text-gray-400 mt-2">Check back later or contact support.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {displayedGarages.map((garage) => (
                    <GarageCard key={garage.id} garage={garage} />
                  ))}
                </div>
                
                {!showMoreNearby && filteredGarages.length > 6 && (
                  <div className="text-center">
                    <Button variant="outline" onClick={() => setShowMoreNearby(true)}>
                      View More ({filteredGarages.length - 6} more)
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

const GarageCard = ({ garage }: { garage: Garage }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {garage.image_url ? (
              <img src={garage.image_url} alt={garage.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-blue-600 font-bold">{garage.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="font-semibold">{garage.average_rating?.toFixed(1) || '0.0'}</span>
            <span className="text-gray-500 text-sm ml-1">({garage.total_reviews || 0})</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{garage.name}</h3>
        
        <div className="flex items-center text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{garage.location || 'Location not specified'}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {garage.services && garage.services.length > 0 ? (
            <>
              {garage.services.slice(0, 2).map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
              {garage.services.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{garage.services.length - 2} more
                </Badge>
              )}
            </>
          ) : (
            <Badge variant="outline" className="text-xs">
              Services available
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pb-6">
        <Button className="w-full" asChild>
          <Link to={`/book/${garage.id}`}>
            Book Now
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Services;
