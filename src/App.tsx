
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotificationManager from "@/components/NotificationManager";
import Index from "./pages/Index";
import Services from "./pages/Services";
import BookingPage from "./pages/BookingPage";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Revvy from "./pages/Revvy";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import BottomNavigation from "./components/BottomNavigation";

// Support pages
import Support from "./pages/Support";
import SupportChat from "./pages/SupportChat";
import CreateTicket from "./pages/CreateTicket";
import CallRequest from "./pages/CallRequest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/services" element={
                <ProtectedRoute>
                  <Services />
                </ProtectedRoute>
              } />
              <Route path="/book/:garageId" element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              } />
              <Route path="/community" element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/:username" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/revvy" element={
                <ProtectedRoute>
                  <Revvy />
                </ProtectedRoute>
              } />
              
              {/* Support routes */}
              <Route path="/support" element={<Support />} />
              <Route path="/support/chat" element={
                <ProtectedRoute>
                  <SupportChat />
                </ProtectedRoute>
              } />
              <Route path="/support/create-ticket" element={<CreateTicket />} />
              <Route path="/support/call-request" element={<CallRequest />} />
              
              {/* Catch all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNavigation />
            <NotificationManager />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
