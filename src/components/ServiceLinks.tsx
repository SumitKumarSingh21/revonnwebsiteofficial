import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Bike, Home, Wrench, MapPin, ChevronRight } from 'lucide-react';

const ServiceLinks = () => {
  const services = [
    {
      title: 'Car Service Near Me',
      description: 'Professional car repair, maintenance & servicing',
      icon: <Car className="h-6 w-6" />,
      link: '/car-service',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Bike Service Near Me', 
      description: 'Motorcycle & scooter repair, maintenance',
      icon: <Bike className="h-6 w-6" />,
      link: '/bike-service',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Doorstep Vehicle Service',
      description: 'Home service for cars & bikes at your location',
      icon: <Home className="h-6 w-6" />,
      link: '/doorstep-service', 
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Car Modifications',
      description: 'Professional vehicle customization & upgrades',
      icon: <Wrench className="h-6 w-6" />,
      link: '/car-modifications',
      color: 'from-red-500 to-red-600'
    }
  ];

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Vehicle Services by Category</h2>
        <p className="text-muted-foreground">Find specialized services for your vehicle needs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service, index) => (
          <Link key={index} to={service.link} className="group">
            <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <CardContent className="p-6 text-center space-y-4">
                <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center text-white shadow-lg`}>
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {service.description}
                  </p>
                </div>
                <div className="flex items-center justify-center text-primary text-sm font-medium">
                  <span>Learn More</span>
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Location-based service links for SEO */}
      <div className="mt-8 p-6 bg-card rounded-lg border">
        <h3 className="text-xl font-bold text-foreground text-center mb-4">
          Vehicle Services Across India
        </h3>
        <div className="text-center text-sm text-muted-foreground space-x-2">
          <span>Popular searches:</span>
          <Link to="/car-service" className="text-primary hover:underline">Car service near me</Link>
          <span>•</span>
          <Link to="/bike-service" className="text-primary hover:underline">Bike servicing near me</Link>
          <span>•</span>
          <Link to="/doorstep-service" className="text-primary hover:underline">Doorstep vehicle service</Link>
          <span>•</span>
          <Link to="/services" className="text-primary hover:underline">Local garage booking</Link>
        </div>
      </div>
    </section>
  );
};

export default ServiceLinks;