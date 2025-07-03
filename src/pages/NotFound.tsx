
import { useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const NotFound = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Check if this is a refresh issue with protected routes
    const protectedRoutes = ['/services', '/community', '/profile', '/settings', '/notifications', '/revvy'];
    const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
    
    if (isProtectedRoute && !loading) {
      if (user) {
        // User is authenticated, redirect to the intended route
        setShouldRedirect(true);
      } else {
        // User is not authenticated, redirect to auth
        setShouldRedirect(true);
      }
    }
  }, [location.pathname, user, loading]);

  // Handle authentication redirects
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Check if this is a protected route that user should have access to
  const protectedRoutes = ['/services', '/community', '/profile', '/settings', '/notifications', '/revvy'];
  const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
  
  if (isProtectedRoute && user) {
    // Redirect authenticated user to the correct route
    return <Navigate to={location.pathname} replace />;
  }

  if (isProtectedRoute && !user) {
    // Redirect unauthenticated user to auth page
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-red-600">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <div className="space-y-2">
          <a 
            href="/" 
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Home
          </a>
          {!user && (
            <a 
              href="/auth" 
              className="inline-block ml-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
