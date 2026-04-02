import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/lib/validation';

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
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10 sm:px-10">
      <Card className="w-full max-w-md border-white/80 bg-white/90 shadow-2xl shadow-slate-200/60 backdrop-blur-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-center text-2xl font-bold text-slate-900">
            Set new password
          </CardTitle>
          <p className="text-center text-sm text-slate-500">
            Use the reset token from your email to set a new password.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Reset Token
              </label>
              <Input
                type="text"
                placeholder="Paste reset token"
                className="h-11 rounded-xl border-slate-200 bg-white/90 shadow-sm focus-visible:ring-cyan-500"
                {...register('token')}
                aria-invalid={Boolean(errors.token)}
              />
              {errors.token ? (
                <p className="mt-1 text-xs text-rose-600">{errors.token.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Minimum 6 characters"
                className="h-11 rounded-xl border-slate-200 bg-white/90 shadow-sm focus-visible:ring-cyan-500"
                {...register('password')}
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password ? (
                <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Re-enter your new password"
                className="h-11 rounded-xl border-slate-200 bg-white/90 shadow-sm focus-visible:ring-cyan-500"
                {...register('confirmPassword')}
                aria-invalid={Boolean(errors.confirmPassword)}
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            {submitError ? (
              <div
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                role="alert"
                aria-live="assertive"
              >
                {submitError}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-200 transition hover:bg-cyan-700"
            >
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </Button>

            <div className="text-center text-sm text-slate-500">
              <Link to="/login" className="font-semibold text-cyan-700 hover:text-cyan-900">
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
