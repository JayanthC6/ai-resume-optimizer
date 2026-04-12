import { useState } from 'react';
import { Map, CheckCircle2, Lock, ChevronRight, BookOpen, FileText, Sparkles, RefreshCw } from 'lucide-react';
import type { SkillGapRoadmap } from '@repo/types';

type Props = {
  skillGapRoadmap: SkillGapRoadmap | null;
  isGenerating: boolean;
  onGenerate: () => void;
};

function formatTimeframe(v: string) {
  if (v === '30_days') return 'Days 1–30';
  if (v === '60_days') return 'Days 31–60';
  if (v === '90_days') return 'Days 61–90';
  return v;
}

const PHASE_HOURS = [8, 12, 10, 6];
const PHASE_PROGRESS = [100, 35, 0, 0];
const PHASE_STATUS: ('completed' | 'in-progress' | 'locked')[] = ['completed', 'in-progress', 'locked', 'locked'];

const CARD_BG = '#161b27';
const BORDER = 'rgba(255,255,255,0.06)';

export function RoadmapPanel({ skillGapRoadmap, isGenerating, onGenerate }: Props) {
  const [activePhase, setActivePhase] = useState(1);

  /* ── Empty / generate state ── */
  if (!skillGapRoadmap) {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-white">Skill Roadmap</h1>
          <p className="text-xs uppercase tracking-widest text-slate-500 mt-1">Your personalised learning path</p>
        </div>

        <div
          className="flex flex-col items-center justify-center rounded-2xl py-24 gap-6 text-center"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
        >
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.12)' }}>
            <Map className="h-8 w-8 text-blue-400" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-xl font-bold text-white mb-2">Build Your Skill Roadmap</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Get a focused 30/60/90-day plan with bite-sized goals, curated learning resources, and mini-projects.
            </p>
          </div>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)', boxShadow: '0 0 30px rgba(37,99,235,0.3)' }}
          >
            {isGenerating ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="h-4 w-4" /> Generate Roadmap</>}
          </button>
        </div>
      </div>
    );
  }

  const phases = skillGapRoadmap.phases ?? [];
  const missingSkills = skillGapRoadmap.missingSkills ?? [];
  const totalHours = phases.length * 10;
  const completedGoals = phases.filter((_, i) => PHASE_STATUS[i] === 'completed').length;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Skill Roadmap</h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 mt-1">AI Career Intelligence</p>
      </div>

      {/* ── Hero Banner ── */}
      <div
        className="relative rounded-2xl px-8 py-7 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0d1420,#162040)', border: '1px solid rgba(37,99,235,0.2)' }}
      >
        <div className="pointer-events-none absolute right-0 top-0 h-full w-64 opacity-10"
          style={{ background: 'radial-gradient(circle at right center,#2563eb,transparent 70%)' }} />
        <p className="text-3xl font-extrabold text-white mb-2">
          Your Path to{' '}
          <span style={{ color: '#60a5fa' }}>
            {missingSkills.slice(0, 2).join(' & ') || 'Career Mastery'}
          </span>
        </p>
        <p className="text-sm text-slate-400 max-w-lg mb-6">
          Based on your recent analysis, we've identified <strong className="text-white">{missingSkills.length} critical skill gaps</strong>.
          Master these to increase your hiring probability.
        </p>
        <div className="flex gap-4 flex-wrap">
          {[
            { label: 'Current Readiness', value: '72%', icon: '📈' },
            { label: 'Est. Time to Mastery', value: `~${totalHours} Hours`, icon: '⏱' },
            { label: 'Goals Completed', value: `${completedGoals} / ${phases.length}`, icon: '✓' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-5 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}` }}>
              <span className="text-lg">{s.icon}</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.label}</p>
                <p className="text-lg font-black text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="relative flex gap-6">
        {/* Left timeline spine */}
        <div className="relative flex flex-col items-center" style={{ width: '32px', flexShrink: 0 }}>
          <div className="absolute top-0 bottom-0 w-0.5 left-1/2 -translate-x-1/2" style={{ background: 'linear-gradient(to bottom, #2563eb, #1e3a5f, #0f1623)' }} />
          {phases.map((_, i) => {
            const status = PHASE_STATUS[i] ?? 'locked';
            return (
              <div key={i} className="relative z-10 mb-0" style={{ marginTop: i === 0 ? 0 : '180px' }}>
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition hover:scale-110"
                  style={{
                    background: status === 'completed' ? '#2563eb' : status === 'in-progress' ? '#1e3a5f' : '#161b27',
                    border: status === 'completed' ? '2px solid #3b82f6' : status === 'in-progress' ? '2px solid #2563eb' : `2px solid ${BORDER}`,
                    boxShadow: status !== 'locked' ? '0 0 12px rgba(37,99,235,0.4)' : 'none',
                  }}
                  onClick={() => setActivePhase(i)}
                >
                  {status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : status === 'in-progress' ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse" />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Phase cards */}
        <div className="flex-1 space-y-4">
          {phases.map((phase, i) => {
            const status = PHASE_STATUS[i] ?? 'locked';
            const hours = PHASE_HOURS[i] ?? 8;
            const progress = PHASE_PROGRESS[i] ?? 0;
            const isLocked = status === 'locked';
            const isActive = status === 'in-progress';
            const isDone = status === 'completed';

            return (
              <div
                key={i}
                className="rounded-2xl transition"
                style={{
                  background: CARD_BG,
                  border: isActive ? '1px solid rgba(37,99,235,0.35)' : `1px solid ${BORDER}`,
                  opacity: isLocked ? 0.7 : 1,
                }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                      style={{
                        background: isDone ? 'rgba(16,185,129,0.12)' : isActive ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.05)',
                        color: isDone ? '#10b981' : isActive ? '#60a5fa' : '#64748b',
                        border: isDone ? '1px solid rgba(16,185,129,0.25)' : isActive ? '1px solid rgba(37,99,235,0.3)' : `1px solid ${BORDER}`,
                      }}
                    >
                      {isDone ? 'Completed' : isActive ? 'In Progress' : 'Locked'}
                    </span>
                    {isActive && (
                      <span className="text-xs font-semibold text-blue-400">Active Focus</span>
                    )}
                    {isDone && (
                      <span className="text-xs text-slate-500">Last updated 2 days ago</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                      style={{
                        background: i === 1 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
                        color: i === 1 ? '#f87171' : '#94a3b8',
                        border: i === 1 ? '1px solid rgba(239,68,68,0.25)' : `1px solid ${BORDER}`,
                      }}
                    >
                      {i === 0 || i === 3 ? 'PRIORITY: HIGH' : i === 2 ? 'PRIORITY: MEDIUM' : 'PRIORITY: HIGH'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{hours} HOURS</span>
                    {isLocked && <Lock className="h-3.5 w-3.5 text-slate-600" />}
                  </div>
                </div>

                {/* Phase title */}
                <div className="px-6 pb-2">
                  <h3 className="text-lg font-bold text-white">{phase.goals?.[0] ?? `${formatTimeframe(phase.timeframe)} Goals`}</h3>
                  {isActive && (
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      {phase.goals?.[1] ?? 'Mastering key competencies essential for high-end engineering roles.'}
                    </p>
                  )}
                </div>

                {/* Progress bar */}
                <div className="px-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${progress}%`,
                          background: isDone ? '#10b981' : 'linear-gradient(90deg,#2563eb,#3b82f6)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white">{progress}%</span>
                  </div>
                </div>

                {/* Expanded content for active phase */}
                {isActive && (
                  <div className="border-t flex flex-col gap-4 px-6 py-5" style={{ borderColor: BORDER }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Recommended Resources</p>
                    <div className="grid grid-cols-2 gap-3">
                      {phase.learningResources.slice(0, 2).map((res, ri) => (
                        <div
                          key={ri}
                          className="flex items-start gap-3 rounded-xl p-3 cursor-pointer transition hover:opacity-80"
                          style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}` }}
                        >
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: ri === 0 ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.05)' }}>
                            {ri === 0 ? <BookOpen className="h-4 w-4 text-blue-400" /> : <FileText className="h-4 w-4 text-slate-400" />}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white leading-tight line-clamp-2">{res}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{ri === 0 ? 'Course' : 'Documentation'} • Official</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* View notes (completed) */}
                {isDone && (
                  <div className="px-6 pb-4">
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition">
                      <ChevronRight className="h-3.5 w-3.5" />
                      View Notes
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AI Coach Tip ── */}
      <div
        className="flex items-start gap-4 rounded-2xl px-6 py-5"
        style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
      >
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white mb-1">AI Coach Tip</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            "Focusing on <strong className="text-white">{missingSkills[0] ?? 'your current goal'}</strong> first will make the upcoming{' '}
            <strong className="text-white">{missingSkills[1] ?? 'next module'}</strong> significantly easier. You're making great progress!"
          </p>
        </div>
        <button
          onClick={onGenerate}
          className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
          style={{ background: '#1e2a3a', border: `1px solid ${BORDER}` }}
        >
          Re-scan Resume
        </button>
      </div>
    </div>
  );
}
