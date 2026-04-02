import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '@/lib/validation';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
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
      const apiError = err as { response?: { data?: { message?: string | string[] } } };
      if (!apiError.response) {
        setSubmitError('Cannot connect to API. Ensure backend is running on http://localhost:8000 and restart web dev server.');
        return;
      }
      const apiMessage = apiError.response?.data?.message;
      const message = Array.isArray(apiMessage)
        ? apiMessage.join(', ')
        : apiMessage || 'Registration failed. Please try again.';
      setSubmitError(message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-10 sm:px-10">
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />

      <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8">
        <Link to="/" className="block h-14 w-52 sm:h-20 sm:w-72">
          <img src="/logo.png" alt="HiredLens" className="h-full w-full object-contain drop-shadow-sm" />
        </Link>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 pt-20 lg:grid-cols-2 lg:pt-10">
        <div className="hidden rounded-3xl border border-white/70 bg-white/70 p-10 shadow-xl shadow-cyan-100/70 backdrop-blur-xl lg:block">
          <p className="mb-4 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Your ATS Co-Pilot
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-900">
            Build role-specific resumes in a single focused workspace
          </h1>
          <p className="mt-4 text-base text-slate-600">
            Join and start optimizing with smart keyword insights, rewrite prompts, and instant scoring.
          </p>
          <ul className="mt-7 space-y-4 text-sm text-slate-700">
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
              Keyword matching plus ATS scoring
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              Ready-to-use summary and bullet rewrites
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              Exportable report for each application
            </li>
          </ul>
        </div>

        <Card className="w-full border-white/80 bg-white/90 shadow-2xl shadow-slate-200/60 backdrop-blur-md lg:max-w-xl lg:justify-self-end">
          <CardHeader className="space-y-2">
            <CardTitle className="text-center text-3xl font-bold text-slate-900">Create account</CardTitle>
            <p className="text-center text-sm text-slate-500">
              Start optimizing your resume today
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleRegister)} className="space-y-5" noValidate>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="h-11 rounded-xl border-slate-200 bg-white/90 shadow-sm focus-visible:ring-cyan-500"
                  {...register('fullName')}
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName ? <p className="mt-1 text-xs text-rose-600">{errors.fullName.message}</p> : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 rounded-xl border-slate-200 bg-white/90 shadow-sm focus-visible:ring-cyan-500"
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
                    placeholder="Minimum 6 characters"
                    className="h-11 rounded-xl border-slate-200 bg-white/90 pr-11 shadow-sm focus-visible:ring-cyan-500"
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
              </div>

              {submitError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert" aria-live="assertive">
                  {submitError}
                </div>
              ) : null}

              <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-cyan-600 text-md text-white shadow-lg shadow-cyan-200 transition hover:bg-cyan-700">
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-cyan-700 hover:text-cyan-900">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}