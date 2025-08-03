import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail } from 'lucide-react';
import LegalModal from './LegalModal';

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: name,
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        toast({
          title: "Welcome to Revonn!",
          description: "Account created successfully.",
        });
        
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      console.error('Google signup error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign up with Google.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2 pb-6">
          <h1 className="text-2xl font-bold text-foreground">Welcome to Revonn</h1>
          <p className="text-muted-foreground">India's #1 Local Garage Booking Platform</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>
          
          <Button
            onClick={handleGoogleSignup}
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
              Already have an account?{' '}
              <Link to="/auth?mode=login" className="text-red-600 hover:underline">
                Log in
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

export default SignupForm;