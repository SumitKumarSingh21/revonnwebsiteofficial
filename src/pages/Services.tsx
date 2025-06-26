
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, ChevronRight, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const Services = () => {
  const [showMoreNearby, setShowMoreNearby] = useState(false);
  const [showMoreTop, setShowMoreTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const nearbyGarages = [
    {
      id: 1,
      name: "AutoCare Hub",
      rating: 4.8,
      distance: "2.3 km",
      services: ["Oil Change", "Brake Service", "AC Repair"],
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Speedy Motors",
      rating: 4.6,
      distance: "3.1 km",
      services: ["Engine Repair", "Suspension", "Detailing"],
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Elite Car Care",
      rating: 4.9,
      distance: "4.5 km",
      services: ["Paint Protection", "Modifications", "Diagnostics"],
      image: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Quick Fix Garage",
      rating: 4.5,
      distance: "5.2 km",
      services: ["Tire Service", "Battery", "Oil Change"],
      image: "/placeholder.svg"
    },
    {
      id: 5,
      name: "Premium Auto",
      rating: 4.7,
      distance: "6.1 km",
      services: ["Luxury Car Service", "Detailing", "Paint"],
      image: "/placeholder.svg"
    }
  ];

  const topGarages = [
    {
      id: 6,
      name: "Champion Motors",
      rating: 4.9,
      distance: "8.3 km",
      services: ["Performance Tuning", "Custom Work", "Racing"],
      image: "/placeholder.svg"
    },
    {
      id: 7,
      name: "Precision Auto",
      rating: 4.8,
      distance: "12.1 km",
      services: ["Electrical", "Engine", "Transmission"],
      image: "/placeholder.svg"
    },
    {
      id: 8,
      name: "Master Mechanics",
      rating: 4.7,
      distance: "15.4 km",
      services: ["All Services", "24/7 Support", "Towing"],
      image: "/placeholder.svg"
    }
  ];

  const allGarages = [...nearbyGarages, ...topGarages];

  const filteredGarages = allGarages.filter(garage =>
    garage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    garage.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayedNearby = showMoreNearby ? nearbyGarages : nearbyGarages.slice(0, 3);
  const displayedTop = showMoreTop ? topGarages : topGarages.slice(0, 3);

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
          /* Search Results */
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Search Results ({filteredGarages.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGarages.map((garage) => (
                <Card key={garage.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{garage.name.charAt(0)}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-semibold">{garage.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{garage.name}</h3>
                    
                    <div className="flex items-center text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{garage.distance} away</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
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
              ))}
            </div>
            {filteredGarages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No garages or services found matching your search.</p>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Nearby Garages Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Nearby Garages</h2>
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {displayedNearby.map((garage) => (
                  <Card key={garage.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">{garage.name.charAt(0)}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="font-semibold">{garage.rating}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{garage.name}</h3>
                      
                      <div className="flex items-center text-gray-500 mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{garage.distance} away</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
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
                ))}
              </div>
              
              {!showMoreNearby && nearbyGarages.length > 3 && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => setShowMoreNearby(true)}>
                    View More ({nearbyGarages.length - 3} more)
                  </Button>
                </div>
              )}
            </section>

            {/* Top Performing Garages Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Top Performing Garages</h2>
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {displayedTop.map((garage) => (
                  <Card key={garage.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-yellow-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-yellow-600 font-bold">{garage.name.charAt(0)}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="font-semibold">{garage.rating}</span>
                          <Badge className="ml-2 bg-yellow-500">Top Rated</Badge>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{garage.name}</h3>
                      
                      <div className="flex items-center text-gray-500 mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{garage.distance} away</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
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
                      </div>
                    </CardContent>
                    
                    <CardFooter className="px-6 pb-6">
                      <Button className="w-full bg-yellow-500 hover:bg-yellow-600" asChild>
                        <Link to={`/book/${garage.id}`}>
                          Book Now
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {!showMoreTop && topGarages.length > 3 && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => setShowMoreTop(true)}>
                    View More ({topGarages.length - 3} more)
                  </Button>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Services;
