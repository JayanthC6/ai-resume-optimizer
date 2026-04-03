import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import type { InterviewQuestionSet } from '@repo/types';

type Props = {
  interviewQuestionSet: InterviewQuestionSet | null;
  isGenerating: boolean;
  onGenerate: () => void;
};

export function InterviewPanel({ interviewQuestionSet, isGenerating, onGenerate }: Props) {
  if (!interviewQuestionSet) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 dark:border-slate-700 dark:bg-slate-900/50">
        <BookOpen className="mb-3 h-8 w-8 text-slate-400 dark:text-slate-500" />
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Generate likely interview questions based on the job description and your resume.</p>
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-200 hover:from-sky-700 hover:to-cyan-700 dark:shadow-sky-900/30"
        >
          {isGenerating ? 'Generating...' : 'Generate Interview Questions'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Technical */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Technical Questions</h3>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            {interviewQuestionSet.technical.length} questions
          </span>
        </div>
        <div className="space-y-3">
          {interviewQuestionSet.technical.map((item, idx) => (
            <details key={idx} className="group rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
              <summary className="cursor-pointer px-4 py-3 list-none">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold leading-relaxed text-slate-900 dark:text-white">Q{idx + 1}. {item.question}</p>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 group-open:hidden dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">Expand</span>
                </div>
              </summary>
              <div className="space-y-2 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-800 dark:text-slate-200">Why asked:</span> {item.whyAsked}</p>
                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sample Answer</p>
                  <p className="max-h-40 overflow-y-auto leading-relaxed text-slate-700 dark:text-slate-300">{item.sampleAnswer}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Behavioral */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Behavioral Questions</h3>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            {interviewQuestionSet.behavioral.length} questions
          </span>
        </div>
        <div className="space-y-3">
          {interviewQuestionSet.behavioral.map((item, idx) => (
            <details key={idx} className="group rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
              <summary className="cursor-pointer px-4 py-3 list-none">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold leading-relaxed text-slate-900 dark:text-white">Q{idx + 1}. {item.question}</p>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 group-open:hidden dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">Expand</span>
                </div>
              </summary>
              <div className="space-y-2 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-800 dark:text-slate-200">Why asked:</span> {item.whyAsked}</p>
                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sample Answer</p>
                  <p className="max-h-40 overflow-y-auto leading-relaxed text-slate-700 dark:text-slate-300">{item.sampleAnswer}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* STAR Answers */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-200">STAR Answer Drafts</h3>
        <div className="space-y-3">
          {interviewQuestionSet.starAnswers.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/60">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Draft {idx + 1}</p>
              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <p><span className="font-semibold text-slate-900 dark:text-white">Situation:</span> {item.situation}</p>
                <p><span className="font-semibold text-slate-900 dark:text-white">Task:</span> {item.task}</p>
                <p><span className="font-semibold text-slate-900 dark:text-white">Action:</span> {item.action}</p>
                <p><span className="font-semibold text-slate-900 dark:text-white">Result:</span> {item.result}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
