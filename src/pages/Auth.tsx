import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import InitialAuthForm from '@/components/InitialAuthForm';
import OTPVerificationForm from '@/components/OTPVerificationForm';
import WelcomeNameForm from '@/components/WelcomeNameForm';
const Auth = () => {
  const [step, setStep] = useState<'initial' | 'otp' | 'welcome'>('initial');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate(from, { replace: true });
      }
    };
    checkUser();
  }, [navigate, from]);
  const handlePhoneSubmit = async (phoneNumber: string) => {
    setIsLoading(true);
    setPhone(phoneNumber);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber
      });

      if (error) throw error;

      toast({
        title: "OTP Sent!",
        description: "Please check your phone for the verification code."
      });
      
      setStep('otp');
    } catch (error: any) {
      console.error('Phone auth error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleOTPVerify = async (otp: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      if (data.user) {
        // Check if user already has a profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user.id)
          .single();

        if (profile && profile.full_name) {
          // Existing user - redirect to home
          toast({
            title: "Welcome back!",
            description: "Successfully signed in."
          });
          navigate(from);
        } else {
          // New user - show welcome form
          setNewUserId(data.user.id);
          setStep('welcome');
        }
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
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
      console.error('Google auth error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    handlePhoneSubmit(phone);
  };

  const handleWelcomeComplete = () => {
    navigate(from);
  };
  if (step === 'initial') {
    return (
      <InitialAuthForm
        onPhoneSubmit={handlePhoneSubmit}
        onGoogleAuth={handleGoogleAuth}
        isLoading={isLoading}
      />
    );
  }

  if (step === 'otp') {
    return (
      <OTPVerificationForm
        phone={phone}
        onVerify={handleOTPVerify}
        onBack={() => setStep('initial')}
        onResend={handleResendOTP}
        isLoading={isLoading}
      />
    );
  }

  if (step === 'welcome' && newUserId) {
    return (
      <WelcomeNameForm
        userId={newUserId}
        onComplete={handleWelcomeComplete}
      />
    );
  }

  return null;
};
export default Auth;