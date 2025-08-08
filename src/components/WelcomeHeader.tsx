import { useState, useEffect } from 'react';
import { MapPin, Navigation, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
const WelcomeHeader = () => {
  const {
    user
  } = useAuth();
  const {
    location,
    loading: locationLoading,
    getCurrentLocation
  } = useLocation();
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
      const {
        data,
        error
      } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
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
    return <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/lovable-uploads/5917b996-fa5e-424e-929c-45aab08219a5.png" alt="Revonn Logo" className="h-10 w-10 rounded-full bg-white p-1" />
            <div>
              <h1 className="text-xl font-bold">Revonn</h1>
              <p className="text-xs opacity-90">Beyond Class</p>
            </div>
          </div>
          <Bell className="h-6 w-6 opacity-80" />
        </div>
      </div>;
  }
  return <div className="bg-gradient-to-br from-primary via-primary to-primary/90 px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <img src="/lovable-uploads/5917b996-fa5e-424e-929c-45aab08219a5.png" alt="Revonn Logo" className="h-8 w-8 rounded-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Revonn</h1>
            <p className="text-xs text-white/80">Beyond Class</p>
          </div>
        </div>
        <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <Bell className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-white/80 text-sm">Welcome back,</p>
        <h2 className="text-2xl font-bold text-white mb-4 py-0">
          {loading ? 'Loading...' : userName}
        </h2>
        
        {/* Location Card */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          {locationLoading ? <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
              <span className="text-white/90 text-sm">Detecting your location...</span>
            </div> : location ? <div className="flex items-start space-x-3">
              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm truncate">
                  {location.city}
                </p>
                <p className="text-white/70 text-xs leading-relaxed truncate">
                  {location.address}
                </p>
              </div>
            </div> : <Button variant="ghost" size="sm" onClick={getCurrentLocation} className="text-white hover:bg-white/20 p-3 h-auto w-full justify-start">
              <Navigation className="h-4 w-4 mr-3" />
              <span className="text-sm">Detect my location</span>
            </Button>}
        </div>
      </div>
    </div>;
};
export default WelcomeHeader;