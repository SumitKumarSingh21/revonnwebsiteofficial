
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backTo?: string;
}

const PageHeader = ({ title, showBackButton = true, backTo = "/" }: PageHeaderProps) => {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button variant="ghost" size="sm" asChild>
                <Link to={backTo}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <div className="flex items-center space-x-3">
              <img src="/lovable-uploads/5917b996-fa5e-424e-929c-45aab08219a5.png" alt="Revonn Logo" className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold text-red-600">Revonn</h1>
                <p className="text-xs text-gray-500">Beyond Class</p>
              </div>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
