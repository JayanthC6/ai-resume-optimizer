import { Badge } from '@/components/ui/badge';
import type { OptimizationResponse } from '@repo/types';

type Props = {
  result: OptimizationResponse;
  candidateName: string;
  roleTitle: string;
  onCopy: (text?: string) => void;
};

function ScoreRing({ label, value, color }: { label: string; value: number; color: string }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-2 flex items-center justify-center rounded-full bg-slate-50 text-lg font-bold text-slate-900 dark:bg-slate-800 dark:text-white">
          {value}%
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}%</p>
      </div>
    </div>
  );
}

export function OverviewPanel({ result, candidateName, roleTitle, onCopy }: Props) {
  const matchScore = Math.max(0, Math.min(100, result.matchScore ?? 0));
  const atsScore = Math.max(0, Math.min(100, result.atsScore ?? 0));
  const topGaps = result.gapAnalysis?.missingSkills?.slice(0, 5) || [];
  const strengths = result.gapAnalysis?.strengths?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Resume Snapshot */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/30 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-sky-950/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Resume Snapshot</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{candidateName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{roleTitle || 'Target role pending'}</p>
          </div>
          <Badge
            className={
              matchScore >= 75
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300'
            }
          >
            {matchScore >= 75 ? 'Ready To Submit' : 'Needs Refinement'}
          </Badge>
        </div>


      </div>

      {/* Score Rings */}
      <div className="grid gap-4 md:grid-cols-2">
        <ScoreRing label="Match Score" value={matchScore} color="#0ea5e9" />
        <ScoreRing label="ATS Score" value={atsScore} color="#06b6d4" />
      </div>

      {/* Strengths & Gaps */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Strengths</h3>
          <div className="flex flex-wrap gap-2">
            {strengths.length > 0 ? (
              strengths.map((s, i) => (
                <Badge key={i} className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">{s}</Badge>
              ))
            ) : (
              <p className="text-xs text-slate-400">No strengths identified yet</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Top Gaps</h3>
          <div className="flex flex-wrap gap-2">
            {topGaps.length > 0 ? (
              topGaps.map((gap, i) => (
                <Badge key={i} className="border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300">{gap}</Badge>
              ))
            ) : (
              <p className="text-xs text-slate-400">No gaps identified</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Rewrite */}
      {result.rewrites?.summary && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Suggested Summary Rewrite</h3>
            <button className="text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400" onClick={() => onCopy(result.rewrites?.summary)}>Copy</button>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{result.rewrites.summary}</p>
        </div>
      )}
    </div>
  );
}
