
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const WelcomeHeader = () => {
  const { user } = useAuth();
  const { location, loading: locationLoading, getCurrentLocation } = useLocation();
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserName(data?.full_name || 'User');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUserName('User');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/5917b996-fa5e-424e-929c-45aab08219a5.png" 
              alt="Revonn Logo" 
              className="h-10 w-10 rounded-full bg-white p-1" 
            />
            <div>
              <h1 className="text-xl font-bold">Revonn</h1>
              <p className="text-xs opacity-90">Beyond Class</p>
            </div>
          </div>
          <Bell className="h-6 w-6 opacity-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/5917b996-fa5e-424e-929c-45aab08219a5.png" 
            alt="Revonn Logo" 
            className="h-10 w-10 rounded-full bg-white p-1" 
          />
          <div>
            <h1 className="text-xl font-bold">Revonn</h1>
            <p className="text-xs opacity-90">Beyond Class</p>
          </div>
        </div>
        <Bell className="h-6 w-6 opacity-80" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm opacity-90">Welcome,</span>
        </div>
        <h2 className="text-lg font-semibold">
          {loading ? 'Loading...' : userName}
        </h2>
        
        {/* Location Section */}
        <div className="flex items-center space-x-2 pt-2">
          {locationLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span className="text-sm opacity-90">Detecting location...</span>
            </div>
          ) : location ? (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {location.city}
                </p>
                <p className="text-xs opacity-80 truncate">
                  {location.address}
                </p>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={getCurrentLocation}
              className="text-white hover:bg-white/20 p-2 h-auto"
            >
              <Navigation className="h-4 w-4 mr-2" />
              <span className="text-sm">Detect Location</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
