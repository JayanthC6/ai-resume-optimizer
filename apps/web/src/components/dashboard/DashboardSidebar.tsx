import { cn } from '@/lib/utils';
import {
  BarChart3,
  BookOpen,
  FileEdit,
  Github,
  KeyRound,
  LayoutDashboard,
  Map,
  Menu,
  X,
  Clock,
} from 'lucide-react';
import { useState } from 'react';

export type TabKey = 'overview' | 'keywords' | 'rewrites' | 'roadmap' | 'interview' | 'portfolio' | 'history';

type SidebarItem = {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
};

const items: SidebarItem[] = [
  { key: 'history', label: 'History', icon: <Clock className="h-4 w-4" /> },
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: 'keywords', label: 'Keywords', icon: <KeyRound className="h-4 w-4" /> },
  { key: 'rewrites', label: 'Rewrites', icon: <FileEdit className="h-4 w-4" /> },
  { key: 'roadmap', label: 'Roadmap', icon: <Map className="h-4 w-4" /> },
  { key: 'interview', label: 'Interview', icon: <BookOpen className="h-4 w-4" /> },
  { key: 'portfolio', label: 'Portfolio', icon: <Github className="h-4 w-4" /> },
];

type Props = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

export function DashboardSidebar({ activeTab, onTabChange }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white/90 p-2.5 shadow-lg backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90 lg:hidden"
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="h-5 w-5 text-slate-700 dark:text-slate-300" /> : <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 flex h-full w-64 flex-col border-r border-slate-200/60 bg-white/95 pt-6 shadow-2xl shadow-slate-200/40 backdrop-blur-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-none lg:static lg:translate-x-0 lg:shadow-none lg:rounded-2xl lg:border lg:h-[calc(100vh-2rem)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="mb-6 flex items-center gap-3 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-200 dark:shadow-sky-900/30">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">HiredLens</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">AI Workspace</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 mb-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Analysis
          </p>
          {items.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onTabChange(item.key);
                  setMobileOpen(false);
                }}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r from-sky-500/10 to-cyan-500/10 text-sky-700 shadow-sm dark:from-sky-500/15 dark:to-cyan-500/15 dark:text-sky-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                    active
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-200 dark:shadow-sky-900/30'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700',
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mx-5 mt-auto mb-5 rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-3 dark:border-slate-800 dark:from-sky-950/40 dark:to-cyan-950/40">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pro Tip</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Upload your resume once; re-run analysis for each new job posting.
          </p>
        </div>
      </aside>
    </>
  );
}
