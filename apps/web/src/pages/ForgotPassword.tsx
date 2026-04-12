import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/validation';
import { useState } from 'react';
import { Mail, ArrowLeft, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const CARD_BG = '#161b27';
const BORDER = 'rgba(255,255,255,0.06)';

export default function ForgotPasswordPage() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerMessage(null);
    setDevResetUrl(null);
    setSuccess(false);

    try {
      const { data } = await api.post('/auth/forgot-password', values);
      setSuccess(true);
      setServerMessage(
        data?.message ||
          'If the account exists, a password reset link will be sent shortly.',
      );
      if (data?.resetUrl) {
        setDevResetUrl(data.resetUrl);
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string | string[] } } };
      const apiMessage = apiError.response?.data?.message;
      const message = Array.isArray(apiMessage)
        ? apiMessage.join(', ')
        : apiMessage || 'Unable to submit request right now. Please try again.';
      setServerMessage(message);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6" style={{ background: '#0f1623' }}>
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full opacity-20 blur-[120px]" style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }} />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full opacity-10 blur-[120px]" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
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
            <h1 className="text-2xl font-extrabold text-white mb-2">Reset Password</h1>
            <p className="text-sm text-slate-400">Enter your email address and we'll send you a secure link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <div className="flex justify-between mb-1.5 px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-400 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  className="h-12 pl-11 rounded-xl border-slate-800 bg-slate-900/50 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50 transition-all"
                  style={{ border: `1px solid ${BORDER}` }}
                  {...register('email')}
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {serverMessage && (
              <div 
                className={`rounded-xl px-4 py-3 flex items-start gap-3 text-sm transition-all animate-in fade-in slide-in-from-top-2 ${
                  success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
                style={{ border: '1px solid' }}
                role="status"
              >
                {success ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                <span>{serverMessage}</span>
              </div>
            )}

            {devResetUrl && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-[10px] text-amber-300">
                <p className="font-bold uppercase tracking-widest mb-1 opacity-60">Development Link</p>
                <a className="font-mono underline break-all" href={devResetUrl}>
                  {devResetUrl}
                </a>
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
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Sending Link...
                </span>
              ) : 'Send Reset Link'}
            </Button>

            <Link 
              to="/login" 
              className="group flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors py-2"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Sign In
            </Link>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-8">
          &copy; 2026 HiredLens AI. All rights reserved. <br/>
          Secure password recovery protocol enabled.
        </p>
      </div>
    </div>
  );
}
