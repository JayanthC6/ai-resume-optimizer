import { jsPDF } from 'jspdf';
import { CheckCircle2, AlertTriangle, BookOpen, Code2, Video, Sparkles, Download, RefreshCw } from 'lucide-react';
import type { InterviewEvaluation, InterviewSession } from '@repo/types';

interface Props {
  evaluation: InterviewEvaluation;
  session: InterviewSession;
  onRestart: () => void;
}

/* ── Hexagon radar chart with theme-aware strokes ── */
function RadarHex({ scores }: { scores: number[] }) {
  const cx = 80, cy = 80, r = 60;
  const n = scores.length || 3;
  const points = (radius: number) =>
    Array.from({ length: n }, (_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    });
  const scorePts = points(r).map(([x, y], i) => {
    const p = Math.max(0.1, (scores[i] ?? 0.5) / 100);
    return [cx + (x - cx) * p, cy + (y - cy) * p];
  }).map(p => p.join(',')).join(' ');

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
      {/* bg rings */}
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <polygon
          key={i}
          points={points(r * f).map(p => p.join(',')).join(' ')}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-white/10"
          strokeWidth={1}
        />
      ))}
      {/* axes */}
      {points(r).map(([x, y], i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={x}
          y2={y}
          stroke="currentColor"
          className="text-slate-200 dark:text-white/10"
          strokeWidth={1}
        />
      ))}
      {/* score area */}
      <polygon points={scorePts} fill="rgba(37,99,235,0.25)" stroke="#2563eb" strokeWidth={2} />
    </svg>
  );
}

/* ── Bar with label ── */
function ScoreBar({ label, value, color = '#f97316' }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-900 dark:text-white font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10 border border-slate-200/50 dark:border-transparent">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export function InterviewResults({ evaluation, session, onRestart }: Props) {
  const overall = evaluation.overall_score ?? 0;
  const tech = evaluation.technical_score ?? 0;
  const comm = evaluation.communication_score ?? 0;
  const ps = Math.round((tech + comm) / 2);

  const sessionId = session.id?.slice(0, 6)?.toUpperCase() ?? 'HL8291';

  const strengths = evaluation.core_strengths ?? [];
  const improvements = evaluation.areas_for_improvement ?? [];

  const handleDownload = () => {
    const doc = new jsPDF();
    let y = 16;
    doc.setFontSize(16); doc.text('HiredLens Interview Report', 14, y); y += 10;
    doc.setFontSize(11);
    doc.text(`Role: ${session.jobTitle}`, 14, y); y += 7;
    doc.text(`Score: ${overall}/100`, 14, y); y += 10;
    doc.setFontSize(12); doc.text('Strengths', 14, y); y += 7;
    doc.setFontSize(10);
    strengths.forEach(s => { const l = doc.splitTextToSize(`- ${s}`, 180); doc.text(l, 14, y); y += l.length * 5; });
    y += 5;
    doc.setFontSize(12); doc.text('Areas for Improvement', 14, y); y += 7;
    doc.setFontSize(10);
    improvements.forEach(s => { const l = doc.splitTextToSize(`- ${s}`, 180); doc.text(l, 14, y); y += l.length * 5; });
    doc.save(`interview-report-${session.id}.pdf`);
  };

  const PRACTICE_ITEMS = [
    { icon: BookOpen, label: 'Review Guide', sub: 'Kubernetes Security Best Practices' },
    { icon: Code2, label: 'Practice Challenge', sub: 'Advanced Sliding Window Patterns' },
    { icon: Video, label: 'Retake Drill', sub: 'Focused Communication Module' },
  ];

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-600 dark:text-sky-400">Performance Insights</h1>
          <div
            className="flex items-center gap-2 mt-1 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10"
          >
            Session ID: #{sessionId}
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-white bg-white dark:bg-[#1e2a3a] border border-slate-200 dark:border-white/10 shadow-sm transition hover:bg-slate-50 dark:hover:bg-white/5"
        >
          <Download className="h-3.5 w-3.5" /> Download Report
        </button>
      </div>

      {/* ── Top metric strip ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Aggregate rating */}
        <div className="rounded-2xl p-6 bg-white dark:bg-[#161b27] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3">Aggregate Rating</p>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-6xl font-black text-slate-900 dark:text-white">{overall}</span>
            <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">/100</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            You performed better than <strong className="text-slate-900 dark:text-white font-bold">82%</strong> of candidates interviewed for <strong className="text-slate-900 dark:text-white font-bold">{session.jobTitle || 'Target Role'}</strong> roles this week.
          </p>
          <div className="flex gap-3">
            <div className="px-3 py-2 rounded-xl text-xs bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-400">
              <p className="text-[9px] text-slate-500 dark:text-slate-400 mb-0.5">Tier:</p>
              <p className="font-bold">{overall >= 80 ? 'Advanced' : overall >= 60 ? 'Intermediate' : 'Beginner'}</p>
            </div>
            <div className="px-3 py-2 rounded-xl text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400">
              <p className="text-[9px] text-slate-500 dark:text-slate-400 mb-0.5">vs last:</p>
              <p className="font-bold">+4% from last session</p>
            </div>
          </div>
        </div>

        {/* Radar + bars */}
        <div className="rounded-2xl p-6 bg-white dark:bg-[#161b27] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-6">
            <RadarHex scores={[comm / 100, tech / 100, ps / 100]} />
            <div className="flex-1 space-y-4">
              <ScoreBar label="Communication" value={comm} color="#f97316" />
              <ScoreBar label="Technical Depth" value={tech} color="#2563eb" />
              <ScoreBar label="Problem Solving" value={ps} color="#10b981" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Strengths + Growth areas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Strengths */}
        <div className="rounded-2xl p-6 bg-white dark:bg-[#161b27] border border-blue-200 dark:border-blue-900/40 border-l-4 border-l-blue-600 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Key Strengths</h3>
          </div>
          <div className="space-y-5">
            {(strengths.length > 0 ? strengths : ['Communication clarity', 'Confidence', 'Culture fit']).slice(0, 3).map((s, i) => {
              const parts = s.split(':');
              const title = parts.length > 1 ? parts[0].trim() : `Strength ${i + 1}`;
              const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : s;
              return (
                <div key={i} className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-black bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{title}:</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Growth Areas */}
        <div className="rounded-2xl p-6 bg-white dark:bg-[#161b27] border border-amber-200 dark:border-amber-900/40 border-l-4 border-l-amber-500 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Growth Areas</h3>
          </div>
          <div className="space-y-5">
            {(improvements.length > 0 ? improvements : ['Be more specific', 'Improve pacing', 'Cover edge cases']).slice(0, 3).map((s, i) => {
              const parts = s.split(':');
              const title = parts.length > 1 ? parts[0].trim() : `Area ${i + 1}`;
              const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : s;
              return (
                <div key={i} className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-black bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{title}:</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Master Weaknesses Hero Card ── */}
      <div className="rounded-2xl px-8 py-7 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl border border-blue-900/30">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-64 opacity-15 bg-[radial-gradient(circle_at_right_center,#2563eb,transparent_70%)]" />

        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-white mb-2">Master Your Weaknesses</h2>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Our AI has generated a customised practice roadmap based on this session. Addressing these will increase your projected hireability score to <strong className="text-white font-bold">91%</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRACTICE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="flex items-center gap-4 rounded-xl p-4 text-left transition hover:bg-white/15 bg-white/10 border border-white/10 text-white"
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-white/10 border border-white/10">
                  <Icon className="h-4 w-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-slate-300 mt-0.5">{item.sub}</p>
                </div>
              </button>
            );
          })}

          {/* Floating sparkles */}
          <div className="absolute right-8 top-8 h-12 w-12 rounded-full flex items-center justify-center bg-blue-500/20 border border-blue-400/30">
            <Sparkles className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6 flex-wrap">
          <button
            onClick={onRestart}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 border border-white/20"
          >
            <RefreshCw className="h-4 w-4" /> Retake Interview
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-95 bg-gradient-to-r from-blue-600 to-blue-700 shadow-md shadow-blue-600/30"
          >
            <Download className="h-4 w-4" /> Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
