
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
    <div className="px-4 py-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Services</h3>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card 
              key={index}
              onClick={handleCategoryClick}
              className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md active:scale-95"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-16 h-16 ${category.lightColor} rounded-2xl flex items-center justify-center`}>
                  <Icon className={`w-8 h-8 text-gray-700`} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                    {category.name}
                  </h4>
                  <p className="text-xs text-gray-500 leading-tight">
                    {category.description}
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

export default ServiceCategories;
