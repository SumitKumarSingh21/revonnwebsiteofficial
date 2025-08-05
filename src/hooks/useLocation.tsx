import { useState, useEffect } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  error?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocationFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      // Using a free geocoding service (you can replace with your preferred service)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get location details');
      }
      
      const data = await response.json();
      
      return {
        address: data.locality || data.city || 'Unknown location',
        city: data.city || data.locality || 'Unknown city'
      };
    } catch (error) {
      console.error('Error getting location details:', error);
      return {
        address: 'Location detected',
        city: 'Current location'
      };
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const locationDetails = await getLocationFromCoordinates(latitude, longitude);

      const locationData: LocationData = {
        latitude,
        longitude,
        address: locationDetails.address,
        city: locationDetails.city
      };

      setLocation(locationData);
      setLoading(false);
      return locationData;
    } catch (error: any) {
      let errorMessage = 'Failed to get your location';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable location permissions.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please try again.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }

      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  // Auto-detect location on hook initialization
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    clearError: () => setError(null)
  };
};