
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PhoneAuthFormProps {
  isSignUp?: boolean;
  fullName?: string;
  onSuccess: () => void;
}

export const PhoneAuthForm = ({ isSignUp = false, fullName, onSuccess }: PhoneAuthFormProps) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const options = isSignUp && fullName ? {
        data: { full_name: fullName }
      } : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options
      });

      if (error) {
        throw error;
      }

      setOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: `Phone ${isSignUp ? 'verification and account creation' : 'sign in'} successful!`,
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast({
        title: "Invalid OTP",
        description: "Please check your verification code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetOtpFlow = () => {
    setOtpSent(false);
    setOtp('');
  };

  if (!otpSent) {
    return (
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Include country code (e.g., +1 for US)
          </p>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send OTP"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
      <div>
        <Label>Phone Number</Label>
        <p className="text-sm text-gray-600">{phone}</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="otp">Enter OTP</Label>
        <div className="flex justify-center">
          <InputOTP value={otp} onChange={setOtp} maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <div className="space-y-2">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? "Verifying..." : isSignUp ? "Verify & Create Account" : "Verify & Sign In"}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={resetOtpFlow}
          className="w-full"
        >
          Change Phone Number
        </Button>
      </div>
    </form>
  );
};
