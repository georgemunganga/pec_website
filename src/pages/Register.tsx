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

export default function Register() {
  const [, setLocation] = useLocation();
  const { applySession } = useAuth();
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [formData, setFormData] = useState({
    name: '',
    identifier: '', // email or phone
    method: 'email' as 'email' | 'phone',
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEmail = (value: string) => {
    return value.includes('@');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'identifier') {
      setFormData(prev => ({
        ...prev,
        identifier: value,
        method: isEmail(value) ? 'email' : 'phone',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.identifier) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.requestOTP(formData.identifier, formData.method);
      toast.success(`OTP sent to your ${formData.method}`);
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
      const response = await authAPI.verifyOTP(formData.identifier, otp);
      const sessionUser = {
        id: response.user?.id ?? Date.now(),
        name: response.user?.name || formData.name,
        email: response.user?.email || (formData.method === 'email' ? formData.identifier : ''),
        phone: response.user?.phone || (formData.method === 'phone' ? formData.identifier : ''),
      };
      applySession({ user: sessionUser, token: response.token });
      toast.success('Account created successfully!');
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
      await authAPI.requestOTP(formData.identifier, formData.method);
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
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2">
            {step === 'input' 
              ? 'Join Pure Essence Apothecary' 
              : 'Enter the code we sent you'
            }
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          {step === 'input' ? (
            <form onSubmit={handleRequestOTP} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Sarah Johnson"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="rounded-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Phone Number</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="you@example.com or +260 97 7883578"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  className="rounded-full"
                />
                <p className="text-xs text-muted-foreground">
                  We'll send you a one-time password to verify
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
                  'Continue'
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
                Change information
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
                  Sent to {formData.identifier}
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
                  'Verify & Create Account'
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
              Already have an account?{' '}
              <Link href="/login">
                <a className="text-primary font-medium hover:underline">
                  Sign in
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
