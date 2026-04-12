import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/lib/validation';

/* ─── tiny avatar stack ─── */
const avatars = [
  'https://i.pravatar.cc/40?img=11',
  'https://i.pravatar.cc/40?img=32',
  'https://i.pravatar.cc/40?img=47',
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const resetSuccessMessage = (location.state as { resetSuccess?: string } | null)?.resetSuccess;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  /* ─── Google Sign-In ─── */
  useEffect(() => {
    if (!googleClientId) return;
    let cancelled = false;

    const handleGoogleCredential = async (credential: string) => {
      setGoogleError(null);
      setGoogleLoading(true);
      try {
        const { data } = await api.post('/auth/google-login', { idToken: credential });
        setAuth(data.user, data.accessToken);
        navigate('/dashboard');
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string | string[] } } };
        const msg = e.response?.data?.message;
        setGoogleError(
          Array.isArray(msg) ? msg.join(', ') : msg || 'Google sign-in failed.',
        );
      } finally {
        setGoogleLoading(false);
      }
    };

    const init = () => {
      if (cancelled || !window.google || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (res) => {
          if (!res.credential) { setGoogleError('No credential received.'); return; }
          void handleGoogleCredential(res.credential);
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline', size: 'large', text: 'continue_with', width: '320',
      });
    };

    if (window.google) { init(); return () => { cancelled = true; }; }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement | null;
    if (existing) { existing.addEventListener('load', init, { once: true }); return () => { cancelled = true; existing.removeEventListener('load', init); }; }

    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true; s.onload = init;
    document.head.appendChild(s);
    return () => { cancelled = true; s.onload = null; };
  }, [googleClientId, navigate, setAuth]);

  const handleLogin = async (values: LoginFormValues) => {
    setSubmitError(null);
    try {
      const { data } = await api.post('/auth/login', values);
      setAuth(data.user, data.accessToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setSubmitError(Array.isArray(msg) ? msg.join(', ') : msg || 'Login failed. Please check credentials and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF2F9] flex flex-col">

      {/* ── Main card area ── */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">

          {/* ── Left: blue panel ── */}
          <div
            className="lg:w-[44%] flex flex-col justify-between p-10 text-white"
            style={{ background: 'linear-gradient(145deg, #1a56d6 0%, #1347b8 100%)' }}
          >
            {/* Logo */}
            <div className="text-xl font-bold tracking-tight">HiredLens</div>

            {/* Headline */}
            <div className="my-10">
              <h1 className="text-4xl font-extrabold leading-tight">
                Elevate your<br />
                career{' '}
                <span style={{ color: '#7dd3fc' }}>trajectory.</span>
              </h1>
              <p className="mt-4 text-sm text-blue-100 leading-relaxed max-w-xs">
                The intelligent lens for your professional identity.
                Log in to access your AI-powered resume optimizer and market analysis dashboard.
              </p>
            </div>

            {/* Social proof card */}
            <div className="rounded-xl border border-blue-400/30 bg-blue-700/30 backdrop-blur-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  {avatars.map((src, i) => (
                    <img key={i} src={src} alt="" className="h-9 w-9 rounded-full border-2 border-blue-500 object-cover" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-blue-100">Joined by 12,000+ professionals</span>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold uppercase tracking-widest text-blue-200 ml-1">Top Rated Career AI</span>
              </div>
            </div>
          </div>

          {/* ── Right: white form panel ── */}
          <div className="flex-1 bg-white px-8 py-10 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="mt-1 text-sm text-slate-500 mb-7">Continue your journey to the next level.</p>

            {/* Success banner */}
            {resetSuccessMessage && (
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700">
                {resetSuccessMessage}
              </div>
            )}

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Google (native rendered or custom) */}
              {googleClientId ? (
                <div ref={googleButtonRef} className="flex items-center justify-center rounded-lg border border-slate-200 h-11 overflow-hidden" />
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 h-11 text-sm font-medium text-slate-700 opacity-40 cursor-not-allowed"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
              )}

              <button
                type="button"
                disabled
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 h-11 text-sm font-medium text-slate-700 opacity-40 cursor-not-allowed"
                title="LinkedIn sign-in coming soon"
              >
                <svg className="h-4 w-4 fill-[#0077B5]" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs uppercase tracking-widest text-slate-400">Or login with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleLogin)} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  {...register('email')}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-800 transition">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-3.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">Remember me for 30 days</span>
              </label>

              {/* Errors */}
              {submitError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm text-rose-600" role="alert">
                  {submitError}
                </div>
              )}
              {googleError && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-700" role="alert">
                  {googleError}
                </div>
              )}
              {googleLoading && (
                <p className="text-center text-xs text-slate-500">Verifying Google account...</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-lg font-semibold text-white text-sm transition active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(90deg, #1a56d6, #1347b8)' }}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In to HiredLens'}
              </button>

              {/* Footer link */}
              <p className="text-center text-sm text-slate-500 pt-1">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800 transition">
                  Start for free
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ── Page footer ── */}
      <footer className="text-center pb-8 flex items-center justify-center gap-6 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        <Link to="/privacy" className="hover:text-slate-600 transition">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-slate-600 transition">Terms of Service</Link>
        <Link to="/security" className="hover:text-slate-600 transition">Security</Link>
      </footer>
    </div>
  );
}