
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Wrench, Droplets, Car, Zap, Settings, Gauge } from 'lucide-react';

const ServiceCategories = () => {
  const navigate = useNavigate();

  const categories = [
    { 
      name: 'General Service', 
      icon: Wrench, 
      color: 'bg-blue-500', 
      lightColor: 'bg-blue-50',
      description: 'Complete car maintenance'
    },
    { 
      name: 'Oil Change', 
      icon: Droplets, 
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      description: 'Engine oil & filter'
    },
    { 
      name: 'Brake Service', 
      icon: Car, 
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      description: 'Brake pads & discs'
    },
    { 
      name: 'Battery Service', 
      icon: Zap, 
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      description: 'Battery check & replace'
    },
    { 
      name: 'AC Repair', 
      icon: Settings, 
      color: 'bg-cyan-500',
      lightColor: 'bg-cyan-50',
      description: 'Air conditioning service'
    },
    { 
      name: 'Diagnostics', 
      icon: Gauge, 
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      description: 'Computer diagnostics'
    },
  ];

  const handleCategoryClick = () => {
    navigate('/services');
  };

  return (
    <div className="px-6 py-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground">Popular Services</h3>
        <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card 
              key={index}
              onClick={handleCategoryClick}
              className="group relative overflow-hidden bg-card hover:shadow-xl transition-all duration-300 cursor-pointer border border-border/50 hover:border-primary/20 active:scale-[0.98] animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-5 relative z-10">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`relative w-16 h-16 ${category.lightColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-foreground" />
                    <div className={`absolute inset-0 ${category.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCategories;
