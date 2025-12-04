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

export default function Login() {
  const [location, setLocation] = useLocation();
  const { applySession } = useAuth();
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [formAlert, setFormAlert] = useState<{
    type: 'error' | 'info';
    message: string;
    action?: { label: string; href: string; prefix?: string };
  } | null>(null);

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

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier) {
      toast.error('Please enter your email or phone number');
      return;
    }

    setIsLoading(true);
    setFormAlert(null);
    try {
      const detectedMethod = isEmail(identifier) ? 'email' : 'phone';
      setMethod(detectedMethod);

      // Step 1: Hit login-with-otp to validate account existence and trigger OTP
      const intent = await authAPI.loginWithOTP(identifier, { storeToken: false });
      const intentPayload = intent?.data ?? intent;

      if (intentPayload?.message) {
        setFormAlert({
          type: 'info',
          message: intentPayload.message,
          action:
            intentPayload.action === 'register'
              ? { label: 'Register', href: '/register', prefix: 'Need an account?' }
              : undefined,
        });
        toast.info(intentPayload.message);
      }

      if (intentPayload?.requires_otp) {
        const otpData = await authAPI.requestOTP(identifier);
        const otpAction = otpData?.action;
        const actionLabel = otpAction === 'register' ? 'Registration' : 'Login';
        toast.success(`${actionLabel} OTP sent to your ${detectedMethod}.`);
        setFormAlert({
          type: 'info',
          message: `${actionLabel} OTP sent to your ${detectedMethod}.`,
          action:
            otpAction === 'register'
              ? { label: 'Register', href: '/register', prefix: 'Need an account?' }
              : undefined,
        });
        setStep('verify');
      } else {
        setStep('input');
      }
    } catch (error: any) {
      const message = error?.message || error?.error?.message || 'Failed to initiate login.';
      if (message.includes('USER_NOT_FOUND') || message.toLowerCase().includes('not found')) {
        const alertMessage = 'No account found for this contact. Please register first.';
        toast.error(alertMessage);
        setFormAlert({
          type: 'error',
          message: alertMessage,
          action: { label: 'Register', href: '/register', prefix: 'Need an account?' },
        });
        return;
      } else if (
        error?.code === 'COOLDOWN_ACTIVE' ||
        error?.code === 'RATE_LIMIT_EXCEEDED' ||
        message.includes('COOLDOWN') ||
        message.toLowerCase().includes('rate limit')
      ) {
        const retryAfter = error?.details?.retry_after ?? 30;
        setCooldown(retryAfter);
        toast.error(
          error?.code === 'RATE_LIMIT_EXCEEDED'
            ? `Too many requests. Please try again in ${retryAfter}s.`
            : `Please wait ${retryAfter}s before requesting another code.`
        );
      } else {
        toast.error(message);
        setFormAlert({ type: 'error', message });
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
        identifier,
        otp,
        context: 'login',
      });

      if (verifyResponse.verified || verifyResponse.data?.verified || verifyResponse.success) {
        // Step 3: Login with OTP
        const loginResponse = await authAPI.loginWithOTP(identifier);

        const userData = loginResponse.user || loginResponse.data?.user;
        const token = loginResponse.token || loginResponse.data?.token || '';

        if (userData && token) {
          const sessionUser = {
            id: userData.id ?? Date.now(),
            name: userData.name || `${userData.first_name} ${userData.last_name}` || 'User',
            email: userData.email || (method === 'email' ? identifier : ''),
            phone: userData.phone || (method === 'phone' ? identifier : ''),
          };

          applySession({ user: sessionUser, token });
          toast.success('Successfully logged in!');
          setLocation('/account');
        } else {
          toast.error('Login failed. Please try again.');
        }
      } else {
        toast.error('OTP verification failed');
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.error?.message || 'Login failed';

      // Check specific error codes
      if (errorMessage.includes('USER_NOT_FOUND') || errorMessage.includes('not found')) {
        const message = 'No account found. Please register first.';
        toast.error(message);
        setFormAlert({
          type: 'error',
          message,
          action: { label: 'Register', href: '/register', prefix: 'Need an account?' },
        });
        setStep('input');
        return;
      } else if (errorMessage.includes('OTP_NOT_VERIFIED')) {
        toast.error('OTP session expired. Please request a new OTP.');
        setStep('input');
      } else if (errorMessage.includes('ACCOUNT_INACTIVE')) {
        toast.error('Account is inactive. Please contact support.');
      } else if (errorMessage.includes('First name') || errorMessage.includes('registration')) {
        const message =
          location === '/register'
            ? 'Please provide your first and last name to complete registration.'
            : 'This contact belongs to a registration flow. Please create an account first.';
        toast.error(message);
        setFormAlert({ type: 'error', message });
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
      const intent = await authAPI.loginWithOTP(identifier, { storeToken: false });
      const intentPayload = intent?.data ?? intent;

      if (intentPayload?.requires_otp) {
        const otpData = await authAPI.requestOTP(identifier);
        const otpAction = otpData?.action;
        const actionLabel = otpAction === 'register' ? 'Registration' : 'Login';
        toast.success(`${actionLabel} OTP sent again to your ${method}.`);
        setFormAlert({
          type: 'info',
          message: `${actionLabel} OTP sent again to your ${method}.`,
          action:
            otpAction === 'register'
              ? { label: 'Register', href: '/register', prefix: 'Need an account?' }
              : undefined,
        });
      } else if (intentPayload?.message) {
        setFormAlert({
          type: 'info',
          message: intentPayload.message,
          action:
            intentPayload.action === 'register'
              ? { label: 'Register', href: '/register', prefix: 'Need an account?' }
              : undefined,
        });
        toast.info(intentPayload.message);
        return;
      }
    } catch (error: any) {
      const message = error?.message || error?.error?.message || 'Failed to resend OTP';
      if (
        error?.code === 'COOLDOWN_ACTIVE' ||
        error?.code === 'RATE_LIMIT_EXCEEDED' ||
        message.includes('COOLDOWN') ||
        message.toLowerCase().includes('rate limit')
      ) {
        const retryAfter = error?.details?.retry_after ?? 30;
        setCooldown(retryAfter);
        toast.error(
          error?.code === 'RATE_LIMIT_EXCEEDED'
            ? `Too many requests. Please try again in ${retryAfter}s.`
            : `Please wait ${retryAfter}s before requesting another code.`
        );
      } else {
        toast.error(message);
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
          <div className="flex justify-end mb-4">
            
          </div>
          {step === 'input' ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
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
                    Verifying & Signing In...
                  </>
                ) : (
                  'Verify & Sign In'
                )}
              </Button>

              <div className="text-center">
                <div className="text-sm">
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
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Create account
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
