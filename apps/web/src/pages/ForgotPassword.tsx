import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/validation';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

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

    try {
      const { data } = await api.post('/auth/forgot-password', values);
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
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10 sm:px-10">
      <Card className="w-full max-w-md border-white/80 bg-white/90 shadow-2xl shadow-slate-200/60 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <CardHeader className="space-y-2">
          <CardTitle className="text-center text-2xl font-bold text-slate-900 dark:text-white">
            Reset your password
          </CardTitle>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Enter your account email and we will send a reset link.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-xl border-slate-200 bg-white/90 shadow-sm focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                {...register('email')}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.email.message}</p>
              ) : null}
            </div>

            {serverMessage ? (
              <div
                className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
                role="status"
                aria-live="polite"
              >
                {serverMessage}
              </div>
            ) : null}

            {devResetUrl ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                Development reset link:{' '}
                <a className="font-semibold underline" href={devResetUrl}>
                  Open reset page
                </a>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-sky-600 font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 dark:shadow-sky-900/30"
            >
              {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
            </Button>

            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              Remembered your password?{' '}
              <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300">
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
