import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const HomePage = lazy(() => import('../pages/Home'));
const LoginPage = lazy(() => import('../pages/Login'));
const RegisterPage = lazy(() => import('../pages/Register'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPassword'));
const DashboardPage = lazy(() => import('../pages/Dashboard'));

function withSuspense(node: React.ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
          Loading HiredLens...
        </div>
      }
    >
      {node}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: withSuspense(<HomePage />) },
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/register', element: withSuspense(<RegisterPage />) },
  { path: '/forgot-password', element: withSuspense(<ForgotPasswordPage />) },
  { path: '/reset-password', element: withSuspense(<ResetPasswordPage />) },
  {
    path: '/dashboard',
    element: withSuspense(
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    )
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
