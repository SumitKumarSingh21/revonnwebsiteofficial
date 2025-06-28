
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, Users, MessageCircle } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/services', icon: Search, label: 'Services' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/revvy', icon: MessageCircle, label: 'Revvy' },
    { path: '/profile', icon: Calendar, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
