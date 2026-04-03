import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { WandSparkles } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { StructuredResumeTemplate } from '../resume/StructuredResumeTemplate';
import type { OptimizationResponse, ResumeRegenerationResponse, StructuredResume } from '@repo/types';

type Props = {
  result: OptimizationResponse;
  regeneratedResume: ResumeRegenerationResponse | null;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onCopy: (text?: string) => void;
  onExportPdf: () => void;
};

function AccordionSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-left">
        <span className="font-semibold text-slate-800 dark:text-slate-200">{title}</span>
        <span className="text-slate-400 transition group-open:rotate-180 dark:text-slate-500">▼</span>
      </summary>
      <div className="px-5 pb-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </details>
  );
}

export function RewritesPanel({ result, regeneratedResume, isRegenerating, onRegenerate, onCopy, onExportPdf }: Props) {
  const draft = regeneratedResume?.updatedResume || regeneratedResume?.regeneratedResume;
  const isStructured = typeof draft === 'object' && draft !== null;
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Optimized_Resume',
  });

  return (
    <div className="space-y-5">
      {/* Regenerate CTA */}
      <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 p-5 dark:border-sky-900 dark:from-sky-950/30 dark:to-cyan-950/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">AI Resume Editor</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Generate an optimized version of your uploaded resume tailored for this role.
            </p>
          </div>
          <Button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-200 hover:from-sky-700 hover:to-cyan-700 dark:shadow-sky-900/30"
          >
            <WandSparkles className="h-4 w-4" />
            {isRegenerating ? 'Editing...' : 'Edit Resume For This Role'}
          </Button>
        </div>
      </div>

      {/* Regenerated draft */}
      {draft && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
              {isStructured ? 'Formatted Resume Preview' : 'Edited Resume Draft'}
            </h3>
            <div className="flex gap-3">
              {!isStructured && (
                <button className="text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400" onClick={() => onCopy(draft as string)}>
                  Copy Text
                </button>
              )}
              <button 
                className="text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400" 
                onClick={isStructured ? () => handlePrint() : onExportPdf}
              >
                {isStructured ? 'Download PDF Document' : 'Export PDF'}
              </button>
            </div>
          </div>
          
          {isStructured ? (
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800 max-h-[70vh] overflow-auto">
               <StructuredResumeTemplate data={draft as unknown as StructuredResume} ref={printRef} />
            </div>
          ) : (
            <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
              {draft as string}
            </div>
          )}

          {regeneratedResume?.changeLog && regeneratedResume.changeLog.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Edit Log</p>
              <div className="space-y-2">
                {regeneratedResume.changeLog.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
                    <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-800 dark:text-slate-200">Before:</span> {item.original}</p>
                    <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-800 dark:text-slate-200">After:</span> {item.updated}</p>
                    <p className="text-slate-500 dark:text-slate-400"><span className="font-semibold text-slate-700 dark:text-slate-300">Why:</span> {item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {regeneratedResume?.highlights && regeneratedResume.highlights.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Highlights</p>
              <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                {regeneratedResume.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Experience & suggestions */}
      <AccordionSection title="Experience Bullet Enhancements" defaultOpen>
        <div className="flex justify-end mb-2">
          <button className="text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400" onClick={() => onCopy(result.rewrites?.experienceText)}>Copy</button>
        </div>
        <div className="whitespace-pre-wrap">{result.rewrites?.experienceText || 'No experience rewrites available.'}</div>
      </AccordionSection>

      <AccordionSection title="Action Verb Upgrades">
        <ul className="space-y-1">
          {result.rewrites?.actionVerbUpgrades?.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
              {item}
            </li>
          ))}
        </ul>
      </AccordionSection>

      <AccordionSection title="Measurable Impact Suggestions">
        <ul className="space-y-1">
          {result.rewrites?.measurableImpactSuggestions?.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
              {item}
            </li>
          ))}
        </ul>
      </AccordionSection>

      <AccordionSection title="Tool/Tech Additions">
        <ul className="space-y-1">
          {result.rewrites?.toolTechAdditions?.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              {item}
            </li>
          ))}
        </ul>
      </AccordionSection>

      <AccordionSection title="Weak Adjectives to Remove">
        <ul className="space-y-1">
          {result.rewrites?.weakAdjectivesToRemove?.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
              {item}
            </li>
          ))}
        </ul>
      </AccordionSection>
    </div>
  );
}
