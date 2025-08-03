import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail } from 'lucide-react';
import LegalModal from './LegalModal';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <img src="/lovable-uploads/aaae1da6-0e09-46c6-8523-ec04acbc268d.png" alt="Revonn Logo" className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back to Revonn</h1>
          <p className="text-muted-foreground">Log in to access trusted garage services</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Phone number or email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>
          
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>
          
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <Mail className="w-4 h-4 mr-2" />
            Continue with Google
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our{' '}
            <button
              onClick={() => setShowTerms(true)}
              className="text-red-600 hover:underline"
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-red-600 hover:underline"
            >
              Privacy Policy
            </button>
            .
          </p>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/auth?mode=signup" className="text-red-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <LegalModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        type="terms"
      />
      <LegalModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        type="privacy"
      />
    </div>
  );
};

export default LoginForm;