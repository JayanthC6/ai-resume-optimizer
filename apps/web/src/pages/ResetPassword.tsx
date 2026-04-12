import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/lib/validation';
import { Lock, Key, CheckCircle2, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';

const CARD_BG = '#161b27';
const BORDER = 'rgba(255,255,255,0.06)';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo<ResetPasswordFormValues>(
    () => ({
      token: tokenFromUrl,
      password: '',
      confirmPassword: '',
    }),
    [tokenFromUrl],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues,
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setSubmitError(null);
    try {
      await api.post('/auth/reset-password', {
        token: values.token,
        password: values.password,
      });
      navigate('/login', {
        replace: true,
        state: { resetSuccess: 'Password updated. Please log in.' },
      });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string | string[] } } };
      const apiMessage = apiError.response?.data?.message;
      const message = Array.isArray(apiMessage)
        ? apiMessage.join(', ')
        : apiMessage || 'Unable to reset password. The token may be invalid or expired.';
      setSubmitError(message);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6" style={{ background: '#0f1623' }}>
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] h-[40%] w-[40%] rounded-full opacity-20 blur-[120px]" style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }} />
        <div className="absolute -bottom-[10%] -left-[10%] h-[40%] w-[40%] rounded-full opacity-10 blur-[120px]" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', boxShadow: '0 0 30px rgba(37,99,235,0.3)' }}>
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">HiredLens</h2>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500 mt-1">Intelligence Redefined</p>
        </div>

        {/* Card */}
        <div 
          className="rounded-3xl p-8 shadow-2xl backdrop-blur-xl transition-all duration-500"
          style={{ 
            background: CARD_BG, 
            border: `1px solid ${BORDER}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-white mb-2">Secure Reset</h1>
            <p className="text-sm text-slate-400">Complete the identity verification by pasting your token and choosing a strong password.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Token Input */}
            <div>
              <div className="flex justify-between mb-1.5 px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Reset Token</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-400 text-slate-500">
                  <Key className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Paste reset token"
                  className="h-12 pl-11 rounded-xl border-slate-800 bg-slate-900/50 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50 transition-all font-mono text-xs"
                  style={{ border: `1px solid ${BORDER}` }}
                  {...register('token')}
                  aria-invalid={Boolean(errors.token)}
                />
              </div>
              {errors.token && (
                <p className="mt-1.5 text-xs font-medium text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.token.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <div className="flex justify-between mb-1.5 px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">New Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-400 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  type="password"
                  placeholder="Minimum 6 characters"
                  className="h-12 pl-11 rounded-xl border-slate-800 bg-slate-900/50 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50 transition-all"
                  style={{ border: `1px solid ${BORDER}` }}
                  {...register('password')}
                  aria-invalid={Boolean(errors.password)}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex justify-between mb-1.5 px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Confirm Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-400 text-slate-500">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <Input
                  type="password"
                  placeholder="Re-enter your new password"
                  className="h-12 pl-11 rounded-xl border-slate-800 bg-slate-900/50 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50 transition-all"
                  style={{ border: `1px solid ${BORDER}` }}
                  {...register('confirmPassword')}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs font-medium text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {submitError && (
              <div 
                className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 flex items-start gap-3 text-sm text-rose-400 transition-all animate-in fade-in slide-in-from-top-2"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)', boxShadow: '0 4px 20px rgba(37,99,235,0.25)' }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Updating Security...
                </span>
              ) : 'Update Password'}
            </Button>

            <Link 
              to="/login" 
              className="group flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors py-2"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to login
            </Link>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-8">
          The security of your account is our top priority. <br/>
          HiredLens uses 256-bit encryption for all credential updates.
        </p>
      </div>
    </div>
  );
}
