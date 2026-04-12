import { Bell, LogOut, ChevronRight } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

type Props = {
  candidateName: string;
  activeTab: string;
  onLogout: () => void;
  onExportReport: () => void;
  onNewAnalysis: () => void;
  hasResults: boolean;
  matchScore?: number;
  atsScore?: number;
  roleTitle?: string;
};

const TAB_LABELS: Record<string, string> = {
  overview: 'Overview',
  keywords: 'Keywords',
  rewrites: 'Rewrites',
  roadmap: 'Skill Roadmap',
  interview: 'Q&A Prep',
  'mock-interview': 'Mock Interview',
  portfolio: 'Portfolio',
  history: 'History',
};

export function DashboardTopBar({
  candidateName,
  activeTab,
  onLogout,
}: Props) {
  const tabLabel = TAB_LABELS[activeTab] ?? 'Overview';
  const initials = candidateName
    ? candidateName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header
      className="flex items-center justify-between px-6 py-3.5 shrink-0"
      style={{
        background: 'var(--topbar-bg, rgba(15,22,35,0.95))',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Left: Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
        <span className="text-slate-500 dark:text-slate-500">Dashboard</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-300 dark:text-slate-300">{tabLabel}</span>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-3">
        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* Bell */}
        <button
          className="relative rounded-xl p-2 text-slate-400 transition hover:text-white hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User chip */}
        <div className="flex items-center gap-2.5 rounded-xl pl-1 pr-3 py-1.5 transition hover:bg-slate-800 cursor-pointer group">
          {/* Avatar */}
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}
          >
            {initials}
          </div>
          <span className="text-sm font-semibold text-slate-300 dark:text-slate-300 hidden sm:block">
            {candidateName}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
          title="Logout"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
