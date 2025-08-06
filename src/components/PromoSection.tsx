
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Percent } from 'lucide-react';

const PromoSection = () => {
  const navigate = useNavigate();

  const promos = [
    {
      title: 'First Service Free',
      description: 'Get your first basic service absolutely free',
      badge: '100% OFF',
      color: 'from-green-500 to-green-600'
    },
    {
      title: '50% Off Oil Change',
      description: 'Premium engine oil change at half price',
      badge: '50% OFF',
      color: 'from-blue-500 to-blue-600'
    }
  ];

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Special Offers</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/services')}
          className="text-red-600 hover:text-red-700"
        >
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {promos.map((promo, index) => (
          <Card 
            key={index}
            className="relative overflow-hidden border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 active:scale-95"
            onClick={() => navigate('/services')}
          >
            <div className={`bg-gradient-to-r ${promo.color} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Percent className="h-5 w-5" />
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">
                      {promo.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg mb-1">{promo.title}</h4>
                  <p className="text-sm opacity-90">{promo.description}</p>
                </div>
                <ArrowRight className="h-6 w-6 opacity-80" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromoSection;
