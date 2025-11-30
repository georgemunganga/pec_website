import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { APP_LOGO, APP_TITLE } from '@/const';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { authAPI } from '@/services/api';

export default function Login() {
  const [, setLocation] = useLocation();
  const { applySession } = useAuth();
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEmail = (value: string) => {
    return value.includes('@');
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier) {
      toast.error('Please enter your email or phone number');
      return;
    }

    setIsLoading(true);
    try {
      const method = isEmail(identifier) ? 'email' : 'phone';
      await authAPI.requestOTP(identifier, method);
      toast.success(`OTP sent to your ${method}`);
      setStep('verify');
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.verifyOTP(identifier, otp);
      const sessionUser = {
        id: response.user?.id ?? Date.now(),
        name: response.user?.name || 'User',
        email: response.user?.email || (isEmail(identifier) ? identifier : ''),
        phone: response.user?.phone || (!isEmail(identifier) ? identifier : ''),
      };
      applySession({ user: sessionUser, token: response.token });
      toast.success('Successfully logged in!');
      setLocation('/account');
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const method = isEmail(identifier) ? 'email' : 'phone';
      await authAPI.requestOTP(identifier, method);
      toast.success('OTP resent successfully');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('input');
    setOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-auto mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            {step === 'input' 
              ? 'Sign in with OTP' 
              : 'Enter the code we sent you'
            }
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          {step === 'input' ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Phone Number</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="you@example.com or +260 97 7883578"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="rounded-full"
                />
                <p className="text-xs text-muted-foreground">
                  We'll send you a one-time password
                </p>
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Change {isEmail(identifier) ? 'email' : 'phone number'}
              </button>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="rounded-full text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Sent to {identifier}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Sign In'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register">
                <a className="text-primary font-medium hover:underline">
                  Create account
                </a>
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Shop */}
        <div className="mt-6 text-center">
          <Link href="/shop">
            <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Continue shopping
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
