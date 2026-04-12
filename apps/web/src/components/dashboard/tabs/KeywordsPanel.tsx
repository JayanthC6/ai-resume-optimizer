import { useState } from 'react';
import type { KeywordAnalysis, OptimizationResponse } from '@repo/types';
import {
  Code2,
  Users,
  Wrench,
  Sparkles,
  Download,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

type Props = {
  keywordData?: KeywordAnalysis | null;
  result?: OptimizationResponse | null;
  roleTitle?: string;
  onApplyRewrites?: () => void;
};

/* ─── Stat Card ─── */
function StatCard({
  label,
  value,
  sub,
  subColor,
  accent,
}: {
  label: string;
  value: string | number;
  sub: string;
  subColor?: string;
  accent?: string;
}) {
  return (
    <div
      className="flex-1 rounded-2xl px-6 py-5"
      style={{
        background: '#161b27',
        border: `1px solid ${accent ?? 'rgba(255,255,255,0.06)'}`,
        borderLeftWidth: accent ? '3px' : '1px',
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{label}</p>
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-black text-white">{value}</span>
        <span className="text-sm font-semibold" style={{ color: subColor ?? '#64748b' }}>
          {sub}
        </span>
      </div>
    </div>
  );
}

/* ─── Keyword Pill ─── */
function KwPill({ label, missing }: { label: string; missing?: boolean }) {
  return (
    <span
      className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition"
      style={{
        background: missing ? 'rgba(251,113,133,0.08)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${missing ? 'rgba(251,113,133,0.25)' : 'rgba(255,255,255,0.1)'}`,
        color: missing ? '#fb7185' : '#cbd5e1',
      }}
    >
      {label}
    </span>
  );
}

/* helpers */
function splitThirds<T>(arr: T[]): [T[], T[], T[]] {
  const third = Math.ceil(arr.length / 3);
  return [arr.slice(0, third), arr.slice(third, third * 2), arr.slice(third * 2)];
}

export function KeywordsPanel({ keywordData, result, roleTitle, onApplyRewrites }: Props) {
  const [filter, setFilter] = useState<'matched' | 'missing'>('matched');

  const matched = keywordData?.matched ?? [];
  const missing = keywordData?.missing ?? [];
  const suggested = keywordData?.suggestedAdditions ?? [];

  const matchedCount = matched.length;
  const missingCount = missing.length;
  const alignmentPct = matchedCount + missingCount > 0
    ? Math.round((matchedCount / (matchedCount + missingCount)) * 100)
    : 0;

  /* split matched keywords into "categories" — Technical / Collaborative / Toolkit */
  const [techKw, collabKw, toolKw] = splitThirds(filter === 'matched' ? matched : missing);

  /* AI optimization tips from suggestedAdditions */
  const aiTips = suggested.slice(0, 2);

  /* action verb upgrades as "instead of" suggestions */
  const actionVerbs = result?.rewrites?.actionVerbUpgrades ?? [];

  const aiScore = result?.matchScore ?? alignmentPct;

  return (
    <div className="flex flex-col h-full space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: '#38bdf8' }}>
            Keyword Semantic Analysis
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">
            {roleTitle || 'Your Target Role'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI SCORE: {aiScore}/100
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="flex gap-4">
        <StatCard
          label="Keywords Matched"
          value={matchedCount}
          sub={`${alignmentPct}% Alignment`}
          accent="rgba(37,99,235,0.4)"
        />
        <StatCard
          label="Missing Critical"
          value={missingCount}
          sub="Action Required"
          subColor="#fb923c"
          accent="rgba(251,113,133,0.3)"
        />
        <StatCard
          label="Impact Potential"
          value={`+${Math.min(missingCount * 1.5, 25).toFixed(0)}%`}
          sub="Post Integration"
          accent="rgba(255,255,255,0.04)"
        />
      </div>

      {/* ── Main Two-Column ── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left: Target Keyword Spectrum */}
        <div
          className="flex-1 rounded-2xl p-6 overflow-y-auto"
          style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white">Target Keyword Spectrum</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Categorized landscape based on job description vs. your resume.
              </p>
            </div>
            {/* Filter toggle */}
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {(['matched', 'missing'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition"
                  style={{
                    background: filter === f
                      ? (f === 'matched' ? 'rgba(37,99,235,0.3)' : 'rgba(251,113,133,0.2)')
                      : 'transparent',
                    color: filter === f
                      ? (f === 'matched' ? '#60a5fa' : '#fb7185')
                      : '#64748b',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Tech Competencies */}
          {techKw.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Technical Competencies
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {techKw.map((kw, i) => (
                  <KwPill key={i} label={kw} missing={filter === 'missing'} />
                ))}
              </div>
            </div>
          )}

          {/* Collaborative Impact */}
          {collabKw.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Collaborative Impact
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {collabKw.map((kw, i) => (
                  <KwPill key={i} label={kw} missing={filter === 'missing'} />
                ))}
              </div>
            </div>
          )}

          {/* Toolkit & Platforms */}
          {toolKw.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Toolkit &amp; Platforms
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {toolKw.map((kw, i) => (
                  <KwPill key={i} label={kw} missing={filter === 'missing'} />
                ))}
              </div>
            </div>
          )}

          {techKw.length === 0 && collabKw.length === 0 && toolKw.length === 0 && (
            <p className="text-sm text-slate-500">No {filter} keywords found.</p>
          )}
        </div>

        {/* Right: AI Optimization + Semantic Context */}
        <div className="w-72 flex flex-col gap-4">

          {/* AI Optimization card */}
          <div
            className="flex-1 rounded-2xl p-5 overflow-y-auto"
            style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(37,99,235,0.15)' }}
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Optimization</h3>
            </div>

            <div className="space-y-5">
              {(aiTips.length > 0 ? aiTips : missing.slice(0, 2)).map((kw, i) => {
                const verb = actionVerbs[i] ?? 'Integrate this keyword into a quantified bullet point.';
                const oldText = `"Worked with ${kw} on various projects."`;
                return (
                  <div key={i}>
                    <p
                      className="text-[10px] font-bold uppercase tracking-wider mb-2"
                      style={{ color: '#fb923c' }}
                    >
                      Integration: {kw}
                    </p>
                    <p className="text-[11px] text-slate-500 mb-1 italic">Instead of:</p>
                    <p className="text-[11px] text-slate-600 line-through mb-2">{oldText}</p>
                    <p className="text-[11px] text-slate-400 italic mb-1">Try this:</p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      "{verb}"
                    </p>
                  </div>
                );
              })}

              {missing.length === 0 && aiTips.length === 0 && (
                <p className="text-xs text-slate-500">Run an analysis to get AI suggestions.</p>
              )}
            </div>
          </div>

          {/* Semantic Context card */}
          <div
            className="rounded-2xl p-5"
            style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">
              Semantic Context
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Industry Relevancy</span>
                  <span className="font-bold text-white">
                    {alignmentPct >= 70 ? 'High' : alignmentPct >= 40 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(alignmentPct + 10, 100)}%`, background: 'linear-gradient(90deg,#f97316,#fb923c)' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">JD Difficulty</span>
                  <span className="font-bold text-white">
                    {missingCount >= 10 ? 'Expert' : missingCount >= 5 ? 'Advanced' : 'Standard'}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: missingCount >= 10 ? '85%' : missingCount >= 5 ? '55%' : '35%',
                      background: 'linear-gradient(90deg,#f97316,#fb923c)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div
        className="flex items-center justify-between rounded-2xl px-6 py-4"
        style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.15)' }}>
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Ready to update your resume?</p>
            <p className="text-xs text-slate-500">Download the optimized keyword list as a guide.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Download className="h-4 w-4" />
            Export Analysis
          </button>
          <button
            onClick={onApplyRewrites}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(90deg, #2563eb, #1d4ed8)' }}
          >
            Apply Rewrites
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
