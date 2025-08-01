import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface OTPVerificationFormProps {
  phone: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
  onResend: () => void;
  isLoading: boolean;
}

const OTPVerificationForm = ({ phone, onVerify, onBack, onResend, isLoading }: OTPVerificationFormProps) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerify(otp);
    }
  };

  const maskedPhone = phone.replace(/(\+91)(\d{3})(\d{3})(\d{4})/, '$1 ***-***-$4');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Verify Your Number</CardTitle>
            <p className="text-muted-foreground">
              We've sent a 6-digit code to {maskedPhone}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP 
                  value={otp} 
                  onChange={setOtp} 
                  maxLength={6}
                  disabled={isLoading}
                >
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

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || otp.length !== 6}
                size="lg"
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button 
                variant="link" 
                onClick={onResend}
                disabled={isLoading}
                className="text-primary"
              >
                Resend OTP
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTPVerificationForm;