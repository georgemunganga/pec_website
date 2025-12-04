import { useEffect, useState } from 'react';
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
    first_name: '',
    last_name: '',
    identifier: '', // email or phone
    method: 'email' as 'email' | 'phone',
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formAlert, setFormAlert] = useState<{
    type: 'error' | 'info';
    message: string;
    action?: { label: string; href: string; prefix?: string };
  } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => {
      setCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

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

  const splitFullName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    const first_name = parts[0] || '';
    const last_name = parts.slice(1).join(' ') || '';
    return { first_name, last_name };
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name || !formData.identifier) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      setFormAlert(null);
      const intent = await authAPI.registerInitiate({
        identifier: formData.identifier,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      const intentPayload = intent?.data ?? intent;
      const intentAction = intentPayload?.action;

      if (intentAction === 'login') {
        const message =
          intentPayload?.message ||
          intent?.message ||
          'This contact already exists. Please sign in.';

        setFormAlert({
          type: 'error',
          message,
          action: { label: 'Sign in', href: '/login', prefix: 'Already have an account?' },
        });
        toast.info(message);
        return;
      }

      const otpData = await authAPI.requestOTP(formData.identifier);
      const otpAction = otpData?.action;
      const actionLabel = otpAction === 'login' ? 'Login' : 'Registration';
      toast.success(`${actionLabel} OTP sent to your ${formData.method}.`);
      setFormAlert({
        type: 'info',
        message: `${actionLabel} OTP sent to your ${formData.method}.`,
        action:
          otpAction === 'login'
            ? { label: 'Sign in', href: '/login', prefix: 'Already have an account?' }
            : undefined,
      });
      setStep('verify');
    } catch (error: any) {
      const errorMessage = error?.message || error?.error?.message || 'Failed to start registration.';
      if (errorMessage.includes('USER_ALREADY_EXISTS') || errorMessage.toLowerCase().includes('already exists')) {
        const message = 'An account with this contact already exists. Please sign in instead.';
        toast.error(message);
        setFormAlert({
          type: 'error',
          message: message,
          action: { label: 'Sign in', href: '/login', prefix: 'Already have an account?' },
        });
        setTimeout(() => setLocation('/login'), 2000);
      } else if (
        error?.code === 'COOLDOWN_ACTIVE' ||
        error?.code === 'RATE_LIMIT_EXCEEDED' ||
        errorMessage.includes('COOLDOWN') ||
        errorMessage.toLowerCase().includes('rate limit')
      ) {
        const retryAfter = error?.details?.retry_after ?? 30;
        setCooldown(retryAfter);
        toast.error(
          error?.code === 'RATE_LIMIT_EXCEEDED'
            ? `Too many requests. Please try again in ${retryAfter}s.`
            : `Please wait ${retryAfter}s before requesting another code.`
        );
      } else {
        toast.error(errorMessage);
        setFormAlert({ type: 'error', message: errorMessage });
      }
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
      // Step 2: Verify OTP
      const verifyResponse = await authAPI.verifyOTP({
        identifier: formData.identifier,
        otp,
        first_name: formData.first_name,
        last_name: formData.last_name,
        context: 'register',
      });

      if (verifyResponse.verified || verifyResponse.data?.verified || verifyResponse.success) {
        const userData = verifyResponse.user || verifyResponse.data?.user;
        const token = verifyResponse.token || verifyResponse.data?.token || '';

        if (userData && token) {
          const sessionUser = {
            id: userData.id ?? Date.now(),
            name: `${userData.first_name} ${userData.last_name}` || userData.name || 'User',
            email: userData.email || (formData.method === 'email' ? formData.identifier : ''),
            phone: userData.phone || (formData.method === 'phone' ? formData.identifier : ''),
          };

          applySession({ user: sessionUser, token });
          toast.success('Account created successfully!');
          setLocation('/account');
        } else {
          toast.error('Registration failed. Please try again.');
        }
      } else {
        toast.error('OTP verification failed');
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.error?.message || 'Registration failed';

      // Check specific error codes
      if (errorMessage.includes('USER_ALREADY_EXISTS') || errorMessage.includes('already exists')) {
        const message = 'An account with this identifier already exists. Please login instead.';
        toast.error(message);
        setFormAlert({
          type: 'error',
          message,
          action: { label: 'Sign in', href: '/login', prefix: 'Already have an account?' },
        });
        setStep('input');
        return;
      } else if (errorMessage.includes('OTP_NOT_VERIFIED')) {
        toast.error('OTP session expired. Please request a new OTP.');
        setStep('input');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const intent = await authAPI.registerInitiate({
        identifier: formData.identifier,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      const intentPayload = intent?.data ?? intent;
      if (intentPayload?.action === 'login') {
        const message =
          intentPayload?.message ||
          intent?.message ||
          'This contact already exists. Please sign in.';
        setFormAlert({
          type: 'error',
          message,
          action: { label: 'Sign in', href: '/login', prefix: 'Already have an account?' },
        });
        toast.info(message);
        return;
      }

      const otpData = await authAPI.requestOTP(formData.identifier);
      const otpAction = otpData?.action;
      const actionLabel = otpAction === 'login' ? 'Login' : 'Registration';
      toast.success(`${actionLabel} OTP sent again to your ${formData.method}.`);
      setFormAlert({
        type: 'info',
        message: `${actionLabel} OTP sent again to your ${formData.method}.`,
        action:
          otpAction === 'login'
            ? { label: 'Sign in', href: '/login', prefix: 'Already have an account?' }
            : undefined,
      });
    } catch (error: any) {
      const errorMessage = error?.message || error?.error?.message || 'Failed to resend OTP';
      if (
        error?.code === 'COOLDOWN_ACTIVE' ||
        error?.code === 'RATE_LIMIT_EXCEEDED' ||
        errorMessage.includes('COOLDOWN') ||
        errorMessage.toLowerCase().includes('rate limit')
      ) {
        const retryAfter = error?.details?.retry_after ?? 30;
        setCooldown(retryAfter);
        toast.error(
          error?.code === 'RATE_LIMIT_EXCEEDED'
            ? `Too many requests. Please try again in ${retryAfter}s.`
            : `Please wait ${retryAfter}s before requesting another code.`
        );
      } else {
        toast.error(errorMessage);
      }
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
              {formAlert && (
                <div
                  role="alert"
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    formAlert.type === 'error'
                      ? 'border-destructive/30 bg-destructive/5 text-destructive'
                      : 'border-primary/30 bg-primary/5 text-primary'
                  }`}
                >
                  <p className="font-medium">{formAlert.message}</p>
                  {formAlert.action && (
                    <p className="mt-2 text-xs">
                      {formAlert.action.prefix ? `${formAlert.action.prefix} ` : ''}
                      <Link href={formAlert.action.href}>
                        <span className="text-primary font-semibold underline-offset-2 hover:underline">
                          {formAlert.action.label}
                        </span>
                      </Link>
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  placeholder="Sarah"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="rounded-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  placeholder="Johnson"
                  value={formData.last_name}
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
                    Verifying & Creating Account...
                  </>
                ) : (
                  'Verify & Create Account'
                )}
              </Button>

              <div className="text-center text-sm">
                {cooldown > 0 ? (
                  <p className="text-muted-foreground">You can request a new code in {cooldown}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    Didn't receive the code? Resend
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Shop */}
        <div className="mt-6 text-center">
          <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
