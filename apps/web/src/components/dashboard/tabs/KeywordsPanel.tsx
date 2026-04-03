import { Badge } from '@/components/ui/badge';
import type { KeywordAnalysis } from '@repo/types';

type Props = {
  keywordData?: KeywordAnalysis | null;
};

export function KeywordsPanel({ keywordData }: Props) {
  if (!keywordData) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No keyword data available. Run an analysis first.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Matched */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            ✓ Matched Keywords ({keywordData.matched?.length || 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            {keywordData.matched?.map((kw, i) => (
              <Badge key={i} className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                {kw}
              </Badge>
            ))}
          </div>
        </div>

        {/* Missing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold text-rose-700 dark:text-rose-400">
            ✗ Missing Keywords ({keywordData.missing?.length || 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            {keywordData.missing?.map((kw, i) => (
              <Badge key={i} className="border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Additions */}
      {(keywordData.suggestedAdditions?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Suggested Additions
          </h3>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {keywordData.suggestedAdditions?.map((kw, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                {kw}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
