import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Revvy = () => {
  return <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/community">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Revvy - AI Assistant</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 mx-0 my-0 px-[25px] py-0">
          <h2 className="text-2xl font-bold mb-4">Meet Revvy - Your Car Care Assistant</h2>
          <p className="text-gray-600 mb-4">
            Get instant answers to your car maintenance questions, service recommendations, and expert advice from our AI-powered assistant.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{
        minHeight: '600px'
      }}>
          <iframe src="https://app.thinkstack.ai/bot/index.html?chatbot_id=6840949343945726cef6df9b&type=inline" frameBorder="0" width="100%" height="100%" style={{
          minHeight: '600px'
        }} title="Revvy AI Assistant" />
        </div>
      </div>
    </div>;
};
export default Revvy;