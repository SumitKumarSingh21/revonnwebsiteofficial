import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session?.user) {
        navigate(from, {
          replace: true
        });
      }
    };
    checkUser();
  }, [navigate, from]);
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Clean up any existing auth state first
      try {
        await supabase.auth.signOut({
          scope: 'global'
        });
      } catch (err) {
        // Continue even if this fails
      }
      const {
        error
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });
      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          toast({
            title: "Account already exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive"
          });
        } else if (error.message.includes('Password')) {
          toast({
            title: "Password Error",
            description: "Password must be at least 6 characters long.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "Account created successfully! Please check your email to verify your account."
        });

        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during signup.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handlePhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Clean up any existing auth state first
      try {
        await supabase.auth.signOut({
          scope: 'global'
        });
      } catch (err) {
        // Continue even if this fails
      }
      if (!otpSent) {
        // Send OTP to phone number
        const {
          error
        } = await supabase.auth.signInWithOtp({
          phone: phone,
          options: {
            data: {
              full_name: fullName
            }
          }
        });
        if (error) {
          if (error.message.includes('Invalid phone number')) {
            toast({
              title: "Invalid Phone Number",
              description: "Please enter a valid phone number with country code (e.g., +1234567890).",
              variant: "destructive"
            });
          } else {
            throw error;
          }
        } else {
          setOtpSent(true);
          toast({
            title: "OTP Sent!",
            description: "Please check your phone for the verification code."
          });
        }
      } else {
        // Verify OTP
        const {
          error
        } = await supabase.auth.verifyOtp({
          phone: phone,
          token: otp,
          type: 'sms'
        });
        if (error) {
          if (error.message.includes('Invalid token')) {
            toast({
              title: "Invalid OTP",
              description: "Please check your verification code and try again.",
              variant: "destructive"
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Success!",
            description: "Phone number verified successfully!"
          });
          // Force page reload for clean state
          window.location.href = from;
        }
      }
    } catch (error: any) {
      console.error('Phone signup error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during phone signup.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Clean up any existing auth state first
      try {
        await supabase.auth.signOut({
          scope: 'global'
        });
      } catch (err) {
        // Continue even if this fails
      }
      if (!otpSent) {
        // Send OTP to phone number
        const {
          error
        } = await supabase.auth.signInWithOtp({
          phone: phone
        });
        if (error) {
          if (error.message.includes('Invalid phone number')) {
            toast({
              title: "Invalid Phone Number",
              description: "Please enter a valid phone number with country code (e.g., +1234567890).",
              variant: "destructive"
            });
          } else {
            throw error;
          }
        } else {
          setOtpSent(true);
          toast({
            title: "OTP Sent!",
            description: "Please check your phone for the verification code."
          });
        }
      } else {
        // Verify OTP
        const {
          error
        } = await supabase.auth.verifyOtp({
          phone: phone,
          token: otp,
          type: 'sms'
        });
        if (error) {
          if (error.message.includes('Invalid token')) {
            toast({
              title: "Invalid OTP",
              description: "Please check your verification code and try again.",
              variant: "destructive"
            });
          } else {
            throw error;
          }
        } else {
          // Force page reload for clean state
          window.location.href = from;
        }
      }
    } catch (error: any) {
      console.error('Phone signin error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during phone signin.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Clean up any existing auth state first
      try {
        await supabase.auth.signOut({
          scope: 'global'
        });
      } catch (err) {
        // Continue even if this fails
      }
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid Credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        // Force page reload for clean state
        window.location.href = from;
      }
    } catch (error: any) {
      console.error('Signin error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during signin.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const resetOtpFlow = () => {
    setOtpSent(false);
    setOtp('');
  };
  return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to Revonn</CardTitle>
            <p className="text-gray-600">Sign in to access all features</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <div className="mb-4">
                  <div className="flex rounded-lg border p-1">
                    <Button type="button" variant={authMethod === 'email' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => {
                    setAuthMethod('email');
                    resetOtpFlow();
                  }}>
                      Email
                    </Button>
                    
                  </div>
                </div>

                {authMethod === 'email' ? <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email">Email</Label>
                      <Input id="signin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Input id="signin-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form> : <form onSubmit={handlePhoneSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="signin-phone">Phone Number</Label>
                      <Input id="signin-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" required disabled={otpSent} />
                    </div>
                    
                    {otpSent && <div className="space-y-2">
                        <Label htmlFor="signin-otp">Enter OTP</Label>
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
                        <Button type="button" variant="ghost" size="sm" onClick={resetOtpFlow} className="w-full">
                          Change Phone Number
                        </Button>
                      </div>}

                    <Button type="submit" className="w-full" disabled={isLoading || otpSent && otp.length !== 6}>
                      {isLoading ? "Processing..." : otpSent ? "Verify OTP" : "Send OTP"}
                    </Button>
                  </form>}
              </TabsContent>

              <TabsContent value="signup">
                <div className="mb-4">
                  <div className="flex rounded-lg border p-1">
                    <Button type="button" variant={authMethod === 'email' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => {
                    setAuthMethod('email');
                    resetOtpFlow();
                  }}>
                      Email
                    </Button>
                    
                  </div>
                </div>

                {authMethod === 'email' ? <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input id="signup-name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <Input id="signup-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" />
                    </div>
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input id="signup-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </form> : <form onSubmit={handlePhoneSignUp} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name-phone">Full Name</Label>
                      <Input id="signup-name-phone" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required disabled={otpSent} />
                    </div>
                    <div>
                      <Label htmlFor="signup-phone-number">Phone Number</Label>
                      <Input id="signup-phone-number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" required disabled={otpSent} />
                    </div>
                    
                    {otpSent && <div className="space-y-2">
                        <Label htmlFor="signup-otp">Enter OTP</Label>
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
                        <Button type="button" variant="ghost" size="sm" onClick={resetOtpFlow} className="w-full">
                          Change Phone Number
                        </Button>
                      </div>}

                    <Button type="submit" className="w-full" disabled={isLoading || otpSent && otp.length !== 6}>
                      {isLoading ? "Processing..." : otpSent ? "Verify & Create Account" : "Send OTP"}
                    </Button>
                  </form>}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Auth;