import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { email, password, fullName });
      setAuth(data.user, data.accessToken);
      navigate('/');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      alert(message);
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
            Create a smarter resume in minutes
          </h1>
          <p className="text-slate-600 text-base">
            Join thousands of job seekers getting ATS‑optimized resumes and tailored suggestions.
          </p>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>✅ Keyword matching + ATS scoring</li>
            <li>✅ Rewrite your summary instantly</li>
            <li>✅ Export your ATS report</li>
          </ul>
        </div>

        {/* Right Register Card */}
        <Card className="w-full shadow-xl border border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create account</CardTitle>
            <p className="text-sm text-slate-500 text-center">
              Start optimizing your resume today
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                  required
                />
              </div>

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
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full h-11 text-md bg-slate-900 hover:bg-slate-800">
                Create Account
              </Button>

              <div className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-slate-900 font-medium hover:underline">
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