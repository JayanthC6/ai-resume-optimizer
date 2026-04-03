import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { Download, LogOut, PlusCircle, ShieldCheck, Sparkles, User } from 'lucide-react';

type Props = {
  candidateName: string;
  roleTitle: string;
  matchScore?: number;
  atsScore?: number;
  onExportReport: () => void;
  onNewAnalysis: () => void;
  onLogout: () => void;
  hasResults: boolean;
};

export function DashboardTopBar({
  candidateName,
  roleTitle,
  matchScore,
  atsScore,
  onExportReport,
  onNewAnalysis,
  onLogout,
  hasResults,
}: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/85 px-5 py-4 shadow-lg shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-none">
      {/* Left: user info + scores */}
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-200 dark:shadow-sky-900/30">
          <User className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{candidateName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{roleTitle || 'No target role set'}</p>
        </div>

        {hasResults && (
          <div className="ml-4 hidden items-center gap-3 sm:flex">
            <div className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 dark:border-sky-800 dark:bg-sky-950/60">
              <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">{matchScore ?? 0}% Match</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 dark:border-cyan-800 dark:bg-cyan-950/60">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">{atsScore ?? 0}% ATS</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {hasResults && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportReport}
              className="rounded-full border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNewAnalysis}
              className="rounded-full border-sky-200 bg-white/90 text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:bg-slate-900/80 dark:text-sky-300 dark:hover:bg-sky-950/60"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Analysis</span>
            </Button>
          </>
        )}
        <ThemeSwitcher />
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="rounded-full border-slate-300 bg-white/90 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
