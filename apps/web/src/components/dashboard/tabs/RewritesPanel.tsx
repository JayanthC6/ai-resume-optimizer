import { useRef, useState, useEffect } from 'react';
import {
  WandSparkles,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle,
  Download,
  Zap,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { StructuredResumeTemplate } from '../resume/StructuredResumeTemplate';
import type {
  OptimizationResponse,
  ResumeRegenerationResponse,
  StructuredResume,
} from '@repo/types';

type Props = {
  result: OptimizationResponse;
  regeneratedResume: ResumeRegenerationResponse | null;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onCopy: (text?: string) => void;
  onExportPdf: () => void;
  originalFile?: File | null;
  originalText?: string | null;
};

/* ── highlight numbers in blue ── */
function NumberHighlight({ text }: { text: string }) {
  const parts = text.split(/(\b\d+(?:\.\d+)?(?:x|%|ms|s|\+)?\b)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\d/.test(p) ? (
          <strong key={i} style={{ color: '#60a5fa', fontWeight: 700 }}>
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

const STRONG_VERBS = [
  'Engineered','Spearheaded','Architected','Optimized','Directed','Led','Delivered',
  'Designed','Built','Launched','Scaled','Reduced','Increased','Implemented',
  'Established','Streamlined','Transformed','Accelerated','Automated','Developed',
];

function AiBullet({ text }: { text: string }) {
  const verb = STRONG_VERBS.find((v) => text.trimStart().startsWith(v));
  if (!verb) return <NumberHighlight text={text} />;
  const rest = text.slice(text.indexOf(verb) + verb.length);
  return (
    <>
      <strong style={{ color: '#38bdf8', fontWeight: 700 }}>{verb}</strong>
      <NumberHighlight text={rest} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════ */
export function RewritesPanel({
  result,
  regeneratedResume,
  isRegenerating,
  onRegenerate,
  onExportPdf,
  originalFile,
  originalText,
}: Props) {
  const draft = regeneratedResume?.updatedResume ?? regeneratedResume?.regeneratedResume;
  const isStructured = typeof draft === 'object' && draft !== null;
  const printRef = useRef<HTMLDivElement>(null);
  const [originalFileUrl, setOriginalFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!originalFile) { setOriginalFileUrl(null); return; }
    const url = URL.createObjectURL(originalFile);
    setOriginalFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [originalFile]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Optimized_Resume',
  });

  const filename = originalFile?.name ?? 'RESUME_V2.PDF';
  const matchPct  = result.matchScore ?? 0;
  const impactScore = `+${Math.min(Math.round(matchPct * 0.45), 50)}%`;
  const hasStrong = (result.rewrites?.actionVerbUpgrades?.length ?? 0) > 0;
  const nextRec   = result.rewrites?.measurableImpactSuggestions?.[0]
    ?? result.rewrites?.toolTechAdditions?.[0]
    ?? "Quantify dataset sizes (e.g., 'Processed 50,000+ data points').";

  /* bullets to display in AI panel when no structured resume */
  const aiBullets: string[] =
    regeneratedResume?.changeLog?.map((c) => c.updated) ??
    result.rewrites?.measurableImpactSuggestions ??
    [];

  /* original bullets */
  const originalBullets = (result.rewrites?.experienceText ?? '')
    .split('\n')
    .filter(Boolean);

  /* ──────────────────────────────────────────────────── */
  /* NO DRAFT: Generate CTA                              */
  /* ──────────────────────────────────────────────────── */
  if (!draft && !isRegenerating) {
    return (
      <div className="flex flex-col gap-4 h-full">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-white">Resume AI Rewrite</h1>
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold text-slate-400"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <FileText className="h-3.5 w-3.5" />
            {filename.toUpperCase()}
          </div>
        </div>

        <div
          className="flex-1 flex flex-col items-center justify-center rounded-2xl gap-5"
          style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)', minHeight: '60vh' }}
        >
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(37,99,235,0.15)' }}
          >
            <WandSparkles className="h-8 w-8 text-blue-400" />
          </div>
          <div className="text-center max-w-sm">
            <h3 className="text-xl font-bold text-white mb-2">AI Resume Rewriter</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate an AI-optimized version of your resume tailored specifically for this role.
              The AI will enhance bullet points, inject keywords, and strengthen your impact statements.
            </p>
          </div>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-white transition hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)', boxShadow: '0 0 30px rgba(37,99,235,0.3)' }}
          >
            <WandSparkles className="h-4 w-4" />
            Generate AI Rewrite
          </button>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────── */
  /* GENERATING spinner                                   */
  /* ──────────────────────────────────────────────────── */
  if (isRegenerating) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-white">Resume AI Rewrite</h1>
        </div>
        <div
          className="flex-1 flex flex-col items-center justify-center rounded-2xl gap-5"
          style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)', minHeight: '60vh' }}
        >
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <WandSparkles className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-slate-400">AI is rewriting your resume…</p>
          <p className="text-xs text-slate-600">Enhancing bullet points, injecting keywords, quantifying impact…</p>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────── */
  /* MAIN: side-by-side comparison                        */
  /* ──────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-4">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-white">Resume AI Rewrite</h1>
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold text-slate-400"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <FileText className="h-3.5 w-3.5" />
            {filename.toUpperCase()}
          </div>
        </div>
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Re-generate
        </button>
      </div>

      {/* ── COMPARISON PANELS ── */}
      <div className="grid grid-cols-2 gap-4" style={{ minHeight: '70vh' }}>

        {/* LEFT — Original Source */}
        <div
          className="rounded-2xl overflow-hidden flex flex-col"
          style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-5 py-3.5 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              <FileText className="h-3.5 w-3.5" />
              Original Source
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
            >
              PDF Parsed
            </span>
          </div>

          {/* Document content */}
          <div className="flex-1 overflow-hidden">
            {originalFileUrl ? (
              /* Real PDF iframe — fills the entire left panel */
              <iframe
                src={originalFileUrl}
                className="w-full h-full border-0"
                title="Original Resume"
                style={{ minHeight: '65vh' }}
              />
            ) : originalText ? (
              /* Extracted text fallback */
              <div
                className="h-full overflow-y-auto p-6"
                style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.8', color: '#94a3b8', whiteSpace: 'pre-wrap' }}
              >
                {originalText}
              </div>
            ) : (
              /* Result data fallback */
              <div className="h-full overflow-y-auto p-8 space-y-6" style={{ minHeight: '60vh' }}>
                <div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                    style={{ color: '#3b82f6', borderBottom: '1px solid rgba(59,130,246,0.2)', paddingBottom: '8px' }}
                  >
                    Experience
                  </div>
                  {originalBullets.length > 0 ? (
                    <ul className="space-y-2.5">
                      {originalBullets.map((b, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                          <span className="shrink-0 mt-1.5" style={{ color: '#475569' }}>•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm" style={{ color: '#64748b' }}>
                      Original resume content unavailable. Upload your PDF to see a side-by-side comparison.
                    </p>
                  )}
                </div>

                {(result.rewrites?.weakAdjectivesToRemove?.length ?? 0) > 0 && (
                  <div>
                    <div
                      className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                      style={{ color: '#f97316', borderBottom: '1px solid rgba(249,115,22,0.2)', paddingBottom: '8px' }}
                    >
                      ⚠ Weak Phrases Detected
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.rewrites?.weakAdjectivesToRemove?.map((w, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg text-xs line-through"
                          style={{ background: 'rgba(249,115,22,0.08)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — AI-Optimized Revision */}
        <div
          className="rounded-2xl overflow-hidden flex flex-col"
          style={{ background: '#161b27', border: '1px solid rgba(37,99,235,0.35)' }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-5 py-3.5 shrink-0"
            style={{ borderBottom: '1px solid rgba(37,99,235,0.2)', background: 'rgba(37,99,235,0.05)' }}
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-400">
              <WandSparkles className="h-3.5 w-3.5" />
              AI-Optimized Revision
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(37,99,235,0.2)', color: '#60a5fa' }}
            >
              ⚡ High Match
            </span>
          </div>

          {/* Document content */}
          <div className="flex-1 overflow-y-auto p-8" ref={printRef} style={{ minHeight: '60vh' }}>
            {isStructured ? (
              /* Structured resume template */
              <div className="bg-white rounded-xl p-6 shadow-xl">
                <StructuredResumeTemplate data={draft as unknown as StructuredResume} />
              </div>
            ) : aiBullets.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
                    style={{ color: '#38bdf8', borderBottom: '1px solid rgba(56,189,248,0.2)', paddingBottom: '8px' }}
                  >
                    Professional Experience — AI Enhanced
                  </div>
                  <ul className="space-y-3">
                    {aiBullets.map((b, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>
                        <span className="shrink-0 mt-1.5 text-blue-400">•</span>
                        <AiBullet text={b} />
                      </li>
                    ))}
                  </ul>
                </div>

                {(result.rewrites?.toolTechAdditions?.length ?? 0) > 0 && (
                  <div>
                    <div
                      className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                      style={{ color: '#10b981', borderBottom: '1px solid rgba(16,185,129,0.2)', paddingBottom: '8px' }}
                    >
                      ✦ Added Technologies
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.rewrites?.toolTechAdditions?.map((t, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : result.rewrites?.experienceText ? (
              <div className="space-y-5">
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                  style={{ color: '#38bdf8', borderBottom: '1px solid rgba(56,189,248,0.2)', paddingBottom: '8px' }}
                >
                  AI-Enhanced Experience
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#cbd5e1' }}>
                  {result.rewrites.experienceText}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <WandSparkles className="h-8 w-8 text-blue-400 opacity-50" />
                <p className="text-sm" style={{ color: '#64748b' }}>AI-generated content will appear here.</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div
            className="flex items-center gap-3 px-5 py-4 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-40"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
            <button
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Adjust Tone
            </button>
            <button
              onClick={() => (isStructured ? handlePrint() : onExportPdf())}
              className="ml-auto flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)' }}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Apply Change
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="rounded-2xl p-5"
          style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Impact Score</p>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-3xl font-black text-white">{impactScore}</span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-500">Increased use of quantitative metrics across all bullet points.</p>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Verb Strength</p>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-3xl font-black text-white">{hasStrong ? 'High' : 'Medium'}</span>
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-xs text-slate-500">Replaced weak verbs with high-impact action verbs.</p>
        </div>

        <div
          className="rounded-2xl p-5 relative"
          style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Next Recommendation</p>
          <p className="text-xs text-white leading-relaxed pr-16">{nextRec}</p>
          <button
            onClick={() => (isStructured ? handlePrint() : onExportPdf())}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-80"
            style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Download className="h-3 w-3" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
