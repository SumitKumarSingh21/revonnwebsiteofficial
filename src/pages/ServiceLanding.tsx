import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Clock, Shield, Award, ChevronRight, Wrench, Car, Bike, Home } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNavigation from '@/components/BottomNavigation';

const ServiceLanding = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();

  // Service-specific content for SEO
  const serviceContent = {
    'car-service': {
      title: 'Car Service Near Me - Professional Car Repair & Maintenance',
      h1: 'Best Car Service Centers Near You - Trusted Car Repair & Maintenance',
      description: 'Book professional car servicing, repairs, and maintenance with verified mechanics across India. Transparent pricing, doorstep service available.',
      keywords: 'car service near me, car repair, car maintenance, auto service, vehicle servicing',
      services: [
        'General Car Service', 'Oil Change Service', 'Brake Repair', 'Engine Diagnostics',
        'AC Service & Repair', 'Battery Replacement', 'Tire Service', 'Car Detailing'
      ],
      icon: <Car className="h-8 w-8" />,
      color: 'from-blue-600 to-blue-800',
      bgColor: 'bg-blue-50'
    },
    'bike-service': {
      title: 'Bike Service Near Me - Professional Bike Repair & Maintenance',
      h1: 'Best Bike Service Centers Near You - Motorcycle & Scooter Repair',
      description: 'Book professional bike servicing, motorcycle repairs, and two-wheeler maintenance with verified mechanics across India.',
      keywords: 'bike service near me, motorcycle repair, scooter service, bike maintenance, two wheeler service',
      services: [
        'General Bike Service', 'Engine Tune-up', 'Brake Service', 'Chain & Sprocket',
        'Tire Replacement', 'Battery Service', 'Electrical Repair', 'Performance Tuning'
      ],
      icon: <Bike className="h-8 w-8" />,
      color: 'from-green-600 to-green-800',
      bgColor: 'bg-green-50'
    },
    'doorstep-service': {
      title: 'Doorstep Vehicle Service - Home Car & Bike Repair Service',
      h1: 'Doorstep Vehicle Service - Professional Car & Bike Repair at Home',
      description: 'Get professional vehicle service at your doorstep. Expert mechanics come to your home/office for car & bike repairs, maintenance, and servicing.',
      keywords: 'doorstep service, home car service, mobile mechanic, vehicle service at home',
      services: [
        'Doorstep Car Service', 'Home Bike Service', 'Mobile Battery Service', 'At-Home Oil Change',
        'Doorstep Brake Repair', 'Mobile AC Service', 'Home Vehicle Inspection', 'Emergency Roadside Assistance'
      ],
      icon: <Home className="h-8 w-8" />,
      color: 'from-purple-600 to-purple-800',
      bgColor: 'bg-purple-50'
    },
    'car-modifications': {
      title: 'Car Modifications & Customization - Professional Auto Enhancement',
      h1: 'Professional Car Modifications & Vehicle Customization Services',
      description: 'Transform your car with professional modifications and customization. Body kits, performance upgrades, interior styling, and more.',
      keywords: 'car modifications, vehicle customization, auto enhancement, car tuning, body kit installation',
      services: [
        'Body Kit Installation', 'Performance Upgrades', 'Interior Styling', 'Audio System Installation',
        'Custom Paint Jobs', 'Alloy Wheel Fitting', 'Suspension Modifications', 'Engine Tuning'
      ],
      icon: <Wrench className="h-8 w-8" />,
      color: 'from-red-600 to-red-800',
      bgColor: 'bg-red-50'
    }
  };

  const currentService = serviceContent[serviceType as keyof typeof serviceContent];

  if (!currentService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <Button onClick={() => navigate('/')}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  // SEO structured data for specific service
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": currentService.title,
    "description": currentService.description,
    "provider": {
      "@type": "Organization",
      "name": "Revonn",
      "url": "https://www.revonn.com"
    },
    "areaServed": "India",
    "serviceType": currentService.services,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${currentService.title} Offers`,
      "itemListElement": currentService.services.map((service, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service
        }
      }))
    }
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <title>{currentService.title}</title>
      <meta name="description" content={currentService.description} />
      <meta name="keywords" content={currentService.keywords} />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      
      <div className="min-h-screen bg-gradient-to-br from-accent via-background to-accent/50">
        <PageHeader title={serviceType?.replace('-', ' ').toUpperCase() || 'Service'} />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${currentService.color} text-white mb-4`}>
              {currentService.icon}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              {currentService.h1}
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              {currentService.description}
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <Button size="lg" onClick={() => navigate('/services')} className="bg-primary hover:bg-primary/90">
                Find Service Centers
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/')}>
                Explore All Services
              </Button>
            </div>
          </section>

          {/* Services Grid */}
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">Available Services</h2>
              <p className="text-muted-foreground">Professional services by verified mechanics</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentService.services.map((service, index) => (
                <Card key={index} className="text-center p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 ${currentService.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <Wrench className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{service}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6 border-0 shadow-lg">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-foreground mb-2">Verified Mechanics</h3>
                <p className="text-muted-foreground text-sm">All our mechanics are verified and certified professionals</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border-0 shadow-lg">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-foreground mb-2">Quality Guaranteed</h3>
                <p className="text-muted-foreground text-sm">100% satisfaction guarantee on all services</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border-0 shadow-lg">
              <CardContent className="p-6">
                <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-foreground mb-2">Quick Service</h3>
                <p className="text-muted-foreground text-sm">Fast and efficient service at your convenience</p>
              </CardContent>
            </Card>
          </section>

          {/* Cities Section for Local SEO */}
          <section className="space-y-6 bg-card p-8 rounded-lg border">
            <h2 className="text-2xl font-bold text-foreground text-center">
              {currentService.title.split(' - ')[0]} Across Major Cities in India
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
              {[
                'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune',
                'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Ranchi', 'Patna',
                'Bhubaneswar', 'Guwahati', 'Indore', 'Nagpur', 'Kochi', 'Chandigarh'
              ].map((city) => (
                <div key={city} className="bg-accent/30 py-2 px-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent/50 transition-colors cursor-pointer">
                  {city}
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Book Your {serviceType?.replace('-', ' ').charAt(0).toUpperCase() + serviceType?.replace('-', ' ').slice(1)}?
            </h2>
            <p className="text-muted-foreground mb-6">
              Connect with verified mechanics and service centers in your area
            </p>
            <Button size="lg" onClick={() => navigate('/services')} className="bg-primary hover:bg-primary/90">
              <MapPin className="h-5 w-5 mr-2" />
              Find Service Centers Near Me
            </Button>
          </section>
        </main>

        <BottomNavigation />
      </div>
    </>
  );
};

export default ServiceLanding;