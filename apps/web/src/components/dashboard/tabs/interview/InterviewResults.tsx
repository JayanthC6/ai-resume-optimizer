import { jsPDF } from 'jspdf';
import { CheckCircle2, AlertTriangle, BookOpen, Code2, Video, Sparkles, Download, RefreshCw } from 'lucide-react';
import type { InterviewEvaluation, InterviewSession } from '@repo/types';

interface Props {
  evaluation: InterviewEvaluation;
  session: InterviewSession;
  onRestart: () => void;
}

const BORDER = 'rgba(255,255,255,0.06)';
const CARD_BG = '#161b27';

/* ── Simple hexagon radar chart ── */
function RadarHex({ scores }: { scores: number[] }) {
  const cx = 80, cy = 80, r = 60;
  const n = scores.length || 3;
  const points = (radius: number) =>
    Array.from({ length: n }, (_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    });
  const bgPts = points(r).map(p => p.join(',')).join(' ');
  const scorePts = points(r).map(([x, y], i) => {
    const p = Math.max(0.1, (scores[i] ?? 0.5) / 100);
    return [cx + (x - cx) * p, cy + (y - cy) * p];
  }).map(p => p.join(',')).join(' ');

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {/* bg rings */}
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <polygon key={i} points={points(r * f).map(p => p.join(',')).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      {/* axes */}
      {points(r).map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      {/* score area */}
      <polygon points={scorePts} fill="rgba(37,99,235,0.2)" stroke="#3b82f6" strokeWidth={2} />
    </svg>
  );
}

/* ── Bar with label ── */
function ScoreBar({ label, value, color = '#f97316' }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-white font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
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
          <h1 className="text-2xl font-extrabold" style={{ color: '#38bdf8' }}>Performance Insights</h1>
          <div
            className="flex items-center gap-2 mt-1 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: `1px solid ${BORDER}` }}
          >
            Session ID: #{sessionId}
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
          style={{ background: '#1e2a3a', border: `1px solid ${BORDER}` }}
        >
          <Download className="h-3.5 w-3.5" /> New Analysis
        </button>
      </div>

      {/* ── Top metric strip ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Aggregate rating */}
        <div className="rounded-2xl p-6" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Aggregate Rating</p>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-6xl font-black text-white">{overall}</span>
            <span className="text-2xl font-bold text-slate-500">/100</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            You performed better than <strong className="text-white">82%</strong> of candidates interviewed for <strong className="text-white">{session.jobTitle || 'Senior Fullstack'}</strong> roles this week.
          </p>
          <div className="flex gap-3">
            <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: '#60a5fa' }}>
              <p className="text-[9px] text-slate-500 mb-1">Tier:</p>
              <p className="font-bold">{overall >= 80 ? 'Advanced' : overall >= 60 ? 'Intermediate' : 'Beginner'}</p>
            </div>
            <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#fb923c' }}>
              <p className="text-[9px] text-slate-500 mb-1">vs last:</p>
              <p className="font-bold">+4% from last session</p>
            </div>
          </div>
        </div>

        {/* Radar + bars */}
        <div className="rounded-2xl p-6" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-6">
            <RadarHex scores={[comm / 100, tech / 100, ps / 100]} />
            <div className="flex-1 space-y-4">
              <ScoreBar label="Communication" value={comm} color="#f97316" />
              <ScoreBar label="Technical Depth" value={tech} color="#f97316" />
              <ScoreBar label="Problem Solving" value={ps} color="#f97316" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Strengths + Growth areas ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Key Strengths */}
        <div className="rounded-2xl p-6" style={{ background: CARD_BG, border: '1px solid rgba(37,99,235,0.25)', borderLeft: '3px solid #2563eb' }}>
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 className="h-5 w-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Key Strengths</h3>
          </div>
          <div className="space-y-5">
            {(strengths.length > 0 ? strengths : ['Communication clarity', 'Confidence', 'Culture fit']).slice(0, 3).map((s, i) => {
              const parts = s.split(':');
              const title = parts.length > 1 ? parts[0].trim() : `Strength ${i + 1}`;
              const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : s;
              return (
                <div key={i} className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-black" style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{title}:</p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Growth Areas */}
        <div className="rounded-2xl p-6" style={{ background: CARD_BG, border: '1px solid rgba(249,115,22,0.25)', borderLeft: '3px solid #f97316' }}>
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Growth Areas</h3>
          </div>
          <div className="space-y-5">
            {(improvements.length > 0 ? improvements : ['Be more specific', 'Improve pacing', 'Cover edge cases']).slice(0, 3).map((s, i) => {
              const parts = s.split(':');
              const title = parts.length > 1 ? parts[0].trim() : `Area ${i + 1}`;
              const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : s;
              return (
                <div key={i} className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-black" style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c' }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{title}:</p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Master Weaknesses ── */}
      <div className="rounded-2xl px-8 py-7 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0d1420,#121c30)', border: `1px solid ${BORDER}` }}>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-64 opacity-10" style={{ background: 'radial-gradient(circle at right center,#2563eb,transparent 70%)' }} />

        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-white mb-2">Master Your Weaknesses</h2>
          <p className="text-sm text-slate-400 max-w-xl">
            Our AI has generated a customised practice roadmap based on this session. Addressing these will increase your projected hireability score to <strong className="text-white">91%</strong>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {PRACTICE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="flex items-center gap-4 rounded-xl p-4 text-left transition hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <Icon className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                </div>
              </button>
            );
          })}

          {/* Floating sparkles */}
          <div className="absolute right-8 top-8 h-12 w-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
            <Sparkles className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onRestart}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            style={{ border: `1px solid ${BORDER}` }}
          >
            <RefreshCw className="h-4 w-4" /> Retake Interview
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)' }}
          >
            <Download className="h-4 w-4" /> Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
