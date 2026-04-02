import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters.')
    .max(80, 'Full name is too long.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
