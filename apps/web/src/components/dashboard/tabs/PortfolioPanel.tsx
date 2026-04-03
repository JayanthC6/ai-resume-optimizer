import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github } from 'lucide-react';
import type { GithubAnalyzerResult } from '@repo/types';

type Props = {
  githubAnalyzer: GithubAnalyzerResult | null;
  githubProfileUrl: string;
  isAnalyzing: boolean;
  onUrlChange: (url: string) => void;
  onAnalyze: () => void;
};

export function PortfolioPanel({ githubAnalyzer, githubProfileUrl, isAnalyzing, onUrlChange, onAnalyze }: Props) {
  if (!githubAnalyzer) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 dark:border-slate-700 dark:bg-slate-900/50">
        <Github className="mb-3 h-8 w-8 text-slate-400 dark:text-slate-500" />
        <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Analyze your GitHub profile to get stronger project bullets for your resume.
        </p>
        <div className="flex w-full max-w-md flex-col gap-3 px-6">
          <Input
            placeholder="https://github.com/username"
            className="h-11 rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            value={githubProfileUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUrlChange(e.target.value)}
          />
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-200 hover:from-sky-700 hover:to-cyan-700 dark:shadow-sky-900/30"
          >
            {isAnalyzing ? 'Analyzing GitHub...' : 'Analyze GitHub Portfolio'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 dark:bg-white">
            <Github className="h-5 w-5 text-white dark:text-slate-900" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">GitHub Account</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{githubAnalyzer.profile}</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Detected Achievements</h3>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {githubAnalyzer.achievements.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Bullet Suggestions */}
      <div className="space-y-3">
        {githubAnalyzer.bulletSuggestions.map((suggestion, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Bullet #{idx + 1}</p>
            <div className="space-y-2 text-sm">
              <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-800 dark:text-slate-200">Original:</span> {suggestion.original}</p>
              <p className="text-slate-800 dark:text-slate-200"><span className="font-semibold">Improved:</span> {suggestion.improved}</p>
              <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-700 dark:text-slate-300">Quantified:</span> {suggestion.quantifiedContribution}</p>
              <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-700 dark:text-slate-300">Tech framing:</span> {suggestion.techStackFraming}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Re-analyze */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="https://github.com/username"
            className="h-10 flex-1 rounded-lg border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            value={githubProfileUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUrlChange(e.target.value)}
          />
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            variant="outline"
            className="rounded-lg border-sky-200 text-sky-700 dark:border-sky-800 dark:text-sky-300"
          >
            {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
          </Button>
        </div>
      </div>
    </div>
  );
}
