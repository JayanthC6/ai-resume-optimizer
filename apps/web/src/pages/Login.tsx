import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/lib/validation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const resetSuccessMessage = (location.state as { resetSuccess?: string } | null)
    ?.resetSuccess;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    let cancelled = false;

    const handleGoogleCredential = async (credential: string) => {
      setGoogleError(null);
      setGoogleLoading(true);
      try {
        const { data } = await api.post('/auth/google-login', { idToken: credential });
        setAuth(data.user, data.accessToken);
        navigate('/dashboard');
      } catch (err: unknown) {
        const apiError = err as { response?: { data?: { message?: string | string[] } } };
        const apiMessage = apiError.response?.data?.message;
        const message = Array.isArray(apiMessage)
          ? apiMessage.join(', ')
          : apiMessage ||
            'Google sign-in failed. Use your password login if your account does not support Google.';
        setGoogleError(message);
      } finally {
        setGoogleLoading(false);
      }
    };

    const initGoogle = () => {
      if (cancelled || !window.google || !googleButtonRef.current) {
        return;
      }

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (!response.credential) {
            setGoogleError('No Google credential received. Please try again.');
            return;
          }
          void handleGoogleCredential(response.credential);
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: '320',
        shape: 'pill',
      });
    };

    if (window.google) {
      initGoogle();
      return () => {
        cancelled = true;
      };
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', initGoogle, { once: true });
      return () => {
        cancelled = true;
        existingScript.removeEventListener('load', initGoogle);
      };
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    script.onerror = () => {
      setGoogleError('Unable to load Google sign-in. Please try again later.');
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.onload = null;
    };
  }, [googleClientId, navigate, setAuth]);

  const handleLogin = async (values: LoginFormValues) => {
    setSubmitError(null);
    try {
      const { data } = await api.post('/auth/login', values);
      setAuth(data.user, data.accessToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string | string[] } } };
      const apiMessage = apiError.response?.data?.message;
      const message = Array.isArray(apiMessage)
        ? apiMessage.join(', ')
        : apiMessage || 'Login failed. Please check credentials and try again.';
      setSubmitError(message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-10 sm:px-10">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl" />

      <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8">
        <Link to="/" className="block h-14 w-52 sm:h-20 sm:w-72">
          <img src="/logo.png" alt="HiredLens" className="h-full w-full object-contain drop-shadow-sm" />
        </Link>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 pt-20 lg:grid-cols-2 lg:pt-10">
        <div className="hidden rounded-3xl border border-white/70 bg-white/70 p-10 shadow-xl shadow-sky-100/70 backdrop-blur-xl lg:block">
          <p className="mb-4 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
            Resume Intelligence
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-900">
            Turn every job description into a clear interview edge
          </h1>
          <p className="mt-4 text-base text-slate-600">
            Upload your resume, benchmark against the role, and ship targeted rewrites in one clean workflow.
          </p>
          <ul className="mt-7 space-y-4 text-sm text-slate-700">
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              ATS and match scoring in seconds
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
              Keyword gaps highlighted with clear additions
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              Rewrite suggestions ready to copy and export
            </li>
          </ul>
        </div>

        <Card className="w-full border-white/80 bg-white/90 shadow-2xl shadow-slate-200/60 backdrop-blur-md lg:max-w-xl lg:justify-self-end">
          <CardHeader className="space-y-2">
            <CardTitle className="text-center text-3xl font-bold text-slate-900">Welcome back</CardTitle>
            <p className="text-center text-sm text-slate-500">
              Sign in to continue optimizing your resume
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-5" noValidate>
              {resetSuccessMessage ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status" aria-live="polite">
                  {resetSuccessMessage}
                </div>
              ) : null}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 rounded-xl border-slate-200 bg-white/90 shadow-sm focus-visible:ring-sky-500"
                  {...register('email')}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-slate-200 bg-white/90 pr-11 shadow-sm focus-visible:ring-sky-500"
                    {...register('password')}
                    aria-invalid={Boolean(errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p> : null}
                <div className="mt-2 text-right">
                  <Link to="/forgot-password" className="text-xs font-medium text-sky-700 hover:text-sky-900">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {submitError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert" aria-live="assertive">
                  {submitError}
                </div>
              ) : null}

              <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-sky-600 text-md text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700">
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-[0.12em] text-slate-400">
                  <span className="bg-white px-2">or</span>
                </div>
              </div>

              {googleClientId ? (
                <div className="space-y-2">
                  <div className="flex justify-center" ref={googleButtonRef} />
                  <p className="text-center text-xs text-slate-500">
                    Continue with Google is available only for accounts already registered in HiredLens.
                  </p>
                </div>
              ) : (
                <p className="text-center text-xs text-slate-500">
                  Google sign-in is currently unavailable.
                </p>
              )}

              {googleLoading ? (
                <p className="text-center text-xs text-slate-500" aria-live="polite">
                  Verifying Google account...
                </p>
              ) : null}

              {googleError ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert" aria-live="polite">
                  {googleError}
                </div>
              ) : null}

              <div className="text-center text-sm text-slate-500">
                Don’t have an account?{' '}
                <Link to="/register" className="font-semibold text-sky-700 hover:text-sky-900">
                  Create one
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}