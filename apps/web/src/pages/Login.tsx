import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed. Please check credentials.');
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
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 rounded-xl border-slate-200 bg-white/90 shadow-sm focus-visible:ring-sky-500"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-slate-200 bg-white/90 pr-11 shadow-sm focus-visible:ring-sky-500"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
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
              </div>

              <Button type="submit" className="h-11 w-full rounded-xl bg-sky-600 text-md text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700">
                Sign In
              </Button>

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