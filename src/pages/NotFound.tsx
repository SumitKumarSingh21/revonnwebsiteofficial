
import { useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const NotFound = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("404 Page accessed:", location.pathname);
  }, [location.pathname]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Define protected routes
  const protectedRoutes = ['/services', '/community', '/profile', '/settings', '/notifications', '/revvy', '/book'];
  const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
  
  // If it's a protected route and user is authenticated, redirect to home and let React Router handle it
  if (isProtectedRoute && user) {
    return <Navigate to="/" replace />;
  }

  // If it's a protected route and user is not authenticated, redirect to auth
  if (isProtectedRoute && !user) {
    return <Navigate to="/auth" replace />;
  }

  // For all other routes, show 404 page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-red-600">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.href = '/'} 
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Home
          </button>
          {!user && (
            <button 
              onClick={() => window.location.href = '/auth'} 
              className="inline-block ml-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
