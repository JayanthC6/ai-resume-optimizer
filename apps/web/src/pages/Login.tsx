import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.accessToken);
      navigate('/');
    } catch (err) {
      alert('Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-blue-50 flex items-center justify-center p-6 relative">
      {/* Top Left Branding */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
        <div className="h-14 w-52 sm:h-20 sm:w-72">
          <img src="/logo.png" alt="HiredLens" className="h-full w-full object-contain mix-blend-darken drop-shadow-sm" />
        </div>
      </div>

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center relative z-10">
        {/* Left Brand Panel */}
        <div className="hidden md:block space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-slate-900">
            Land more interviews with ATS‑optimized resumes
          </h1>
          <p className="text-slate-600 text-base">
            Upload your resume, paste the job description, and receive instant ATS scoring,
            keyword matching, and rewrite suggestions.
          </p>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>✅ ATS score + match score in seconds</li>
            <li>��� Missing keywords clearly highlighted</li>
            <li>✅ Professionally rewritten bullets</li>
          </ul>
        </div>

        {/* Right Login Card */}
        <Card className="w-full shadow-xl border border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <p className="text-sm text-slate-500 text-center">
              Sign in to continue optimizing your resume
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-11 text-md bg-slate-900 hover:bg-slate-800">
                Sign In
              </Button>

              <div className="text-center text-sm text-slate-500">
                Don’t have an account?{' '}
                <Link to="/register" className="text-slate-900 font-medium hover:underline">
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