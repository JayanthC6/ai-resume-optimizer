import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, Zap, Brain, Target, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '@/lib/validation';



export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const handleRegister = async (values: RegisterFormValues) => {
    setSubmitError(null);
    try {
      const { data } = await api.post('/auth/register', values);
      setAuth(data.user, data.accessToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      if (!e.response) {
        setSubmitError('Cannot connect to API. Ensure backend is running.');
        return;
      }
      const msg = e.response?.data?.message;
      setSubmitError(Array.isArray(msg) ? msg.join(', ') : msg || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d1117' }}>

      {/* ── Top logo bar ── */}
      <div className="px-8 py-5 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-white tracking-tight">HiredLens</span>
      </div>

      {/* ── Main split layout ── */}
      <div className="flex flex-1 items-center">

        {/* ── Left: dark panel ── */}
        <div className="hidden lg:flex flex-col justify-center px-14 py-12 w-[48%] h-full">
          {/* Headline */}
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-10">
            See your potential<br />
            through a{' '}
            <em className="not-italic" style={{ color: '#38bdf8' }}>different<br />lens.</em>
          </h1>

          {/* What you unlock */}
          <div className="space-y-3 mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: '#38bdf8' }}>What you unlock for free</p>
            {[
              { icon: Zap, color: '#facc15', label: 'Instant ATS Score', desc: 'Know exactly how your resume performs' },
              { icon: Brain, color: '#a78bfa', label: 'AI Resume Rewrite', desc: 'Gemini AI tailors every bullet to the job' },
              { icon: Target, color: '#34d399', label: 'Keyword Gap Analysis', desc: 'Never miss a critical keyword again' },
              { icon: MessageSquare, color: '#f472b6', label: 'AI Mock Interviews', desc: 'Practice with an AI interviewer, anytime' },
            ].map(({ icon: Icon, color, label, desc }) => (
              <div key={label} className="flex items-start gap-3.5 rounded-xl px-4 py-3.5 transition hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}18` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    {label}
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Motivational tagline */}
          <div className="rounded-2xl px-5 py-4" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.1))', border: '1px solid rgba(37,99,235,0.25)' }}>
            <p className="text-sm font-semibold text-white leading-relaxed">
              “Your next offer is one optimized resume away.”
            </p>
            <p className="text-xs text-slate-400 mt-1.5">Start free. No credit card. No limits on analysis.</p>
          </div>
        </div>

        {/* ── Right: form panel ── */}
        <div
          className="flex-1 flex items-center justify-center px-6 lg:px-14 py-12"
          style={{ background: '#111827' }}
        >
          <div className="w-full max-w-[440px]">
            <h2 className="text-3xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-sm text-slate-400 mb-8">Start your journey to career intelligence today.</p>

            {/* Google CTA */}
            <button
              type="button"
              onClick={() => window.location.href = '/login'}
              className="w-full h-12 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-3 transition hover:opacity-90 active:scale-[0.98] mb-6"
              style={{ background: '#1f2937', border: '1px solid #374151' }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-700" /></div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs uppercase tracking-widest font-semibold" style={{ background: '#111827', color: '#6b7280' }}>
                  Or with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleRegister)} noValidate className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full h-11 rounded-xl px-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  style={{ background: '#1f2937', border: '1px solid #374151' }}
                  {...register('fullName')}
                />
                {errors.fullName && <p className="mt-1 text-xs text-rose-400">{errors.fullName.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full h-11 rounded-xl px-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  style={{ background: '#1f2937', border: '1px solid #374151' }}
                  {...register('email')}
                />
                {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full h-11 rounded-xl px-3.5 pr-11 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    style={{ background: '#1f2937', border: '1px solid #374151' }}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password
                  ? <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
                  : <p className="mt-1.5 text-xs text-slate-500">Must be at least 6 characters with one number.</p>
                }
              </div>

              {/* Server error */}
              {submitError && (
                <div className="rounded-xl px-4 py-3 text-sm text-rose-300 border border-rose-800 bg-rose-950/40" role="alert">
                  {submitError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl font-bold text-sm uppercase tracking-widest text-white transition active:scale-[0.98] disabled:opacity-60 mt-2"
                style={{ background: 'linear-gradient(90deg, #2563eb, #1d4ed8)' }}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Footer links */}
              <p className="text-center text-sm text-slate-500 pt-1">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition">
                  Log in
                </Link>
              </p>

              <p className="text-center text-xs text-slate-600 leading-relaxed">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="underline hover:text-slate-400 transition">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline hover:text-slate-400 transition">Privacy Policy</Link>.
                Your data is encrypted with enterprise-grade security.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}