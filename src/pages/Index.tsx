import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Bike, CheckCircle, MapPin, Wrench, DollarSign, Star, ArrowRight, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Index = () => {
  return <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/5917b996-fa5e-424e-929c-45aab08219a5.png" alt="Revonn Logo" className="h-8 w-8" />
              <div>
                <span className="text-2xl font-bold text-red-600">Revonn</span>
                <p className="text-xs text-gray-500">Beyond Class</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/services" className="text-gray-700 hover:text-red-600 transition-colors">Services</Link>
              <Link to="/community" className="text-gray-700 hover:text-red-600 transition-colors">Community</Link>
              <Link to="/profile" className="text-gray-700 hover:text-red-600 transition-colors">Profile</Link>
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <Link to="/services">Book Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Trusted Platform for Verified Car & Bike Services, 
              <span className="text-orange-300"> Modifications & Support</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100 max-w-3xl mx-auto">
              Professional vehicle care at your doorstep with verified partners and transparent pricing
            </p>
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg" asChild>
              <Link to="/services">
                Book a Service <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Revonn Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">About Revonn</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Revonn is a growing vehicle service solution, bringing verified professionals to your doorstep. 
            We aim to simplify car and bike maintenance, modifications, and emergency care through real-time bookings 
            and trusted service providers — all under one platform.
          </p>
        </div>
      </section>

      {/* Why Choose Revonn */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Revonn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verified Garages & Detailers</h3>
              <p className="text-gray-600">All our partners are thoroughly vetted and certified professionals</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <DollarSign className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transparent Pricing</h3>
              <p className="text-gray-600">No hidden charges, upfront pricing for all services</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Car className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Car & Bike Services</h3>
              <p className="text-gray-600">Complete vehicle care for both cars and motorcycles</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Wrench className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Wide Range of Services</h3>
              <p className="text-gray-600">From basic maintenance to custom modifications</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <MapPin className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Available in Ranchi</h3>
              <p className="text-gray-600">Expanding soon to more cities across India</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Star className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">100% satisfaction guarantee on all services</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book a Service</h3>
              <p className="text-gray-600">Choose your vehicle service and schedule via our app or website</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Service</h3>
              <p className="text-gray-600">Verified partner visits you or you visit their garage</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment & Feedback</h3>
              <p className="text-gray-600">Secure payment and rate your experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Experience Revonn?</h2>
          <p className="text-xl mb-8 text-red-100">
            Join thousands of satisfied customers who trust Revonn for their vehicle care needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4">
              <Download className="mr-2 h-5 w-5" />
              Download the App
            </Button>
            <Button size="lg" variant="outline" className="border-white text-red-600 hover:bg-gray hover:text-red-600 px-8 py-4" asChild>
              <Link to="/community">
                <Users className="mr-2 h-5 w-5" />
                Explore Community
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src="/lovable-uploads/5917b996-fa5e-424e-929c-45aab08219a5.png" alt="Revonn Logo" className="h-6 w-6" />
            <span className="text-xl font-bold">Revonn</span>
          </div>
          <p className="text-gray-400">© 2025 Revonn. All rights reserved. | Your trusted vehicle service platform.</p>
        </div>
      </footer>
    </div>;
};
export default Index;