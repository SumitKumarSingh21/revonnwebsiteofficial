
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Clock, Star, Shield, Users } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Book Service',
      description: 'Schedule your next service',
      icon: Clock,
      color: 'bg-blue-500',
      path: '/services'
    },
    {
      title: 'Top Rated',
      description: 'Best garages near you',
      icon: Star,
      color: 'bg-yellow-500',
      path: '/services'
    },
    {
      title: 'Trusted Partners',
      description: 'Verified mechanics',
      icon: Shield,
      color: 'bg-green-500',
      path: '/services'
    },
    {
      title: 'Community',
      description: 'Connect with others',
      icon: Users,
      color: 'bg-purple-500',
      path: '/community'
    }
  ];

  return (
    <div className="px-4 py-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card 
              key={index}
              onClick={() => navigate(action.path)}
              className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md active:scale-95"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
