
import WelcomeHeader from '@/components/WelcomeHeader';
import ServiceCategories from '@/components/ServiceCategories';
import QuickActions from '@/components/QuickActions';
import PromoSection from '@/components/PromoSection';
import BottomNavigation from '@/components/BottomNavigation';

const Index = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Welcome Header */}
      <WelcomeHeader />

      {/* Main Content */}
      <div className="pb-20">
        {/* Service Categories */}
        <ServiceCategories />
        
        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
