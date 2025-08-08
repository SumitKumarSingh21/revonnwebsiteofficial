
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
    <div className="px-6 py-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground">Quick Actions</h3>
        <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card 
              key={index}
              onClick={() => navigate(action.path)}
              className="group relative overflow-hidden bg-card hover:shadow-xl transition-all duration-300 cursor-pointer border border-border/50 hover:border-primary/20 active:scale-[0.98] animate-fade-in"
              style={{ animationDelay: `${(index + 6) * 100}ms` }}
            >
              <div className="p-5 relative z-10">
                <div className="flex items-center space-x-4">
                  <div className={`relative w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors duration-300 mb-1">
                      {action.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-muted/50 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                    <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
