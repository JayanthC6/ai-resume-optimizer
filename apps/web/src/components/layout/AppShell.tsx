import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { cn } from '@/lib/utils';

type AppShellProps = {
  title: string;
  subtitle?: string;
  userLabel?: string;
  onLogout?: () => void;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, userLabel, onLogout, children }: AppShellProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = useMemo(
    () => [
      { to: '/', label: 'Home' },
      { to: '/dashboard', label: 'Dashboard' },
    ],
    []
  );

  return (
    <div className="relative z-10 mx-auto w-full max-w-7xl space-y-6">
      <a
        href="#main-content"
        className="sr-only rounded-md border border-sky-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>

      <header className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-none sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="block h-12 w-40 sm:h-16 sm:w-56">
              <img src="/logo.png" alt="HiredLens" className="h-full w-full object-contain" />
            </Link>
            <div className="hidden border-l border-slate-300 pl-4 dark:border-slate-700 md:block">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
              {subtitle ? <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <nav aria-label="Primary navigation" className="mr-2 flex items-center gap-1">
              {links.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-medium transition',
                      active
                        ? 'bg-sky-600 text-white shadow'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <ThemeSwitcher />
            {userLabel ? (
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                {userLabel}
              </span>
            ) : null}
            {onLogout ? (
              <Button variant="outline" size="sm" onClick={onLogout} className="rounded-full border-slate-300 bg-white/90 dark:border-slate-700 dark:bg-slate-900/80">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : null}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {mobileOpen ? (
          <div id="mobile-nav" className="mt-4 space-y-4 border-t border-slate-200 pt-4 dark:border-slate-800 md:hidden">
            <nav aria-label="Mobile navigation" className="grid gap-2">
              {links.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm font-medium transition',
                      active
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200'
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center justify-between gap-2">
              <ThemeSwitcher />
              {onLogout ? (
                <Button variant="outline" size="sm" onClick={onLogout} className="rounded-full">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>

      <main id="main-content">{children}</main>
    </div>
  );
}
