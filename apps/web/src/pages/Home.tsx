import { ArrowRight, CheckCircle2, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

export default function HomePage() {
  const token = useAuthStore((state) => state.token);

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-8 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl dark:bg-blue-500/10" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-5 py-4 shadow-lg shadow-slate-200/50 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80 dark:shadow-none sm:px-7">
        <Link to="/" className="h-16 w-64 sm:h-20 sm:w-80 lg:h-24 lg:w-[26rem]">
          <img src="/logo.png" alt="HiredLens" className="h-full w-full object-contain object-left" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link to="/login">
            <Button variant="outline" className="rounded-full border-slate-300 bg-white/90 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Login</Button>
          </Link>
          <Link to={token ? '/dashboard' : '/register'}>
            <Button className="rounded-full bg-sky-600 text-white hover:bg-sky-700">
              {token ? 'Open Workspace' : 'Get Started'}
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto mt-8 grid w-full max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-2xl shadow-sky-100/60 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/70 dark:shadow-none sm:p-10">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            Modern Resume Intelligence
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 dark:text-white sm:text-5xl">
            Build role-specific resumes that pass ATS and win interviews
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Upload your resume once, match any job description, and get actionable rewrites in minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={token ? '/dashboard' : '/register'}>
              <Button className="h-11 rounded-full bg-sky-600 px-6 text-white hover:bg-sky-700">
                {token ? 'Go To Dashboard' : 'Create Free Account'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {!token && (
              <Link to="/login">
                <Button variant="outline" className="h-11 rounded-full border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">I already have an account</Button>
              </Link>
            )}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">98%</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">ATS readiness clarity</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">3x</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">faster role tailoring</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">1 click</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">report export workflow</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/70 bg-white/85 p-8 shadow-2xl shadow-cyan-100/60 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/70 dark:shadow-none sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Why teams choose HiredLens</h2>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <Target className="h-4 w-4 text-sky-600" />
              Role-Match Scoring
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">See how well your resume aligns with each target position before you apply.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Keyword Gap Insights
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Know exactly which keywords are missing and what to add for better ATS ranking.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              AI Rewrite Suggestions
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Instantly improve summary and experience bullets with stronger, measurable language.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
