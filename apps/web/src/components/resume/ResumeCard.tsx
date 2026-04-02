import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, ShieldCheck, Sparkles } from 'lucide-react';

type ResumeCardProps = {
  candidateName: string;
  roleTitle: string;
  matchScore?: number;
  atsScore?: number;
  status: 'ready' | 'needs-work' | 'in-progress';
  updatedAtLabel: string;
};

const statusConfig = {
  ready: {
    label: 'Ready To Submit',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  'needs-work': {
    label: 'Needs Refinement',
    className: 'border-orange-200 bg-orange-50 text-orange-700',
  },
  'in-progress': {
    label: 'In Progress',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
} as const;

const clampScore = (value?: number) => Math.max(0, Math.min(100, value ?? 0));

export function ResumeCard({
  candidateName,
  roleTitle,
  matchScore,
  atsScore,
  status,
  updatedAtLabel,
}: ResumeCardProps) {
  const safeMatch = clampScore(matchScore);
  const safeAts = clampScore(atsScore);
  const tone = statusConfig[status];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Resume Snapshot</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{candidateName}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{roleTitle || 'Target role pending'}</p>
        </div>
        <Badge className={tone.className}>{tone.label}</Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            <Sparkles className="h-3.5 w-3.5" /> Match Score
          </p>
          <p className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{safeMatch}%</p>
          <Progress value={safeMatch} className="h-2 bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5" /> ATS Score
          </p>
          <p className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{safeAts}%</p>
          <Progress value={safeAts} className="h-2 bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" /> HiredLens Professional Profile
        </span>
        <span>{updatedAtLabel}</span>
      </div>
    </article>
  );
}
