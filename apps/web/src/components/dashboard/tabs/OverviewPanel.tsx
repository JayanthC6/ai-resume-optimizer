import type { OptimizationResponse } from '@repo/types';
import { ArrowRight, FileText, Pencil, Mic, ChevronRight } from 'lucide-react';

type Props = {
  result: OptimizationResponse;
  candidateName: string;
  roleTitle: string;
  onCopy?: (text?: string) => void;
  onTabChange?: (tab: string) => void;
  onNewAnalysis?: () => void;
};

/* ─── Circular Score Ring ─── */
function ScoreRing({ value }: { value: number }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const progress = (pct / 100) * circ;

  const color =
    pct >= 75 ? '#10b981' : pct >= 50 ? '#3b82f6' : '#f59e0b';

  return (
    <div className="relative h-36 w-36 mx-auto">
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90 w-full h-full">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circ}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white">{pct}</span>
        <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-0.5">Percent</span>
      </div>
    </div>
  );
}

/* ─── Card Shell ─── */
function MetricCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {children}
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    icon: FileText,
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.15)',
    title: 'Start New Analysis',
    desc: 'Upload a new resume or job description to get instant AI feedback.',
    tab: 'setup',
  },
  {
    icon: Pencil,
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.15)',
    title: 'Resume AI Rewrite',
    desc: 'Optimize your existing resume for specific job descriptions automatically.',
    tab: 'rewrites',
  },
  {
    icon: Mic,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    title: 'Launch Interview Simulator',
    desc: 'Practice with our AI interviewer and get real-time voice analysis.',
    tab: 'mock-interview',
  },
];

const RECENT_ACTIVITY = [
  {
    icon: '✓',
    iconBg: 'rgba(16,185,129,0.15)',
    iconColor: '#10b981',
    title: 'Resume Analysis: Senior Product Designer',
    sub: 'GOOGLE INC. • 2 HOURS AGO',
    badge: '82% Match',
    badgeStyle: { color: '#60a5fa' },
  },
  {
    icon: '✎',
    iconBg: 'rgba(59,130,246,0.12)',
    iconColor: '#3b82f6',
    title: 'AI Rewrite: Experience Section',
    sub: 'SELF IMPROVEMENT • 5 HOURS AGO',
    badge: 'Completed',
    badgeStyle: { color: '#94a3b8' },
  },
];

export function OverviewPanel({ result, candidateName, roleTitle, onTabChange, onNewAnalysis }: Props) {
  const matchScore = Math.max(0, Math.min(100, result.matchScore ?? 0));
  const atsScore   = Math.max(0, Math.min(100, result.atsScore   ?? 0));
  const firstName  = candidateName?.split(' ')[0] || 'there';
  const topGaps    = result.gapAnalysis?.missingSkills?.slice(0, 3) || ['SQL Foundations', 'Data Visualization', 'Agile Leadership'];
  const missingKw  = result.gapAnalysis?.missingSkills?.slice(0, 3) || [];

  const handleTabChange = (tab: string) => {
    if (tab === 'setup') { onNewAnalysis?.(); }
    else { onTabChange?.(tab as any); }
  };

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ── */}
      <div
        className="relative rounded-2xl px-8 py-7 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #111827 0%, #1a2744 100%)', border: '1px solid rgba(37,99,235,0.2)' }}
      >
        {/* Decorative glow */}
        <div className="pointer-events-none absolute right-8 top-4 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: '#2563eb' }} />

        <h2 className="text-3xl font-extrabold text-white mb-2">
          Welcome back, <span style={{ color: '#60a5fa' }}>{firstName}.</span>
        </h2>
        <p className="text-slate-400 text-sm max-w-lg">
          Your current resume score is{' '}
          <strong className="text-white">{matchScore}%</strong>.
          {atsScore > matchScore - 5
            ? ` You've improved by ${Math.abs(atsScore - matchScore)}% since last week. Let's close those final gaps.`
            : ` Keep optimizing to close the remaining skill gaps.`}
        </p>
      </div>

      {/* ── Three Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Card 1: Overall Score */}
        <MetricCard>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-6">Overall Score</p>
          <ScoreRing value={matchScore} />
          <p className="text-center text-xs text-slate-500 mt-5">
            Top 15% of candidates in{' '}
            <strong className="text-white">{roleTitle || 'Product Design'}</strong>
          </p>
        </MetricCard>

        {/* Card 2: Keyword Match */}
        <MetricCard>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-5">Keyword Match %</p>

          <div className="space-y-3 mb-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-slate-300 font-medium">ATS Compatibility</span>
                <span className="text-lg font-black text-white">{atsScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${atsScore}%`, background: 'linear-gradient(90deg, #2563eb, #06b6d4)' }}
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-3">Top Missing Keywords</p>
            <div className="flex flex-wrap gap-2">
              {(missingKw.length > 0 ? missingKw : ['Stakeholder Management', 'A/B Testing', 'Prototyping']).map((kw, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: i === 0 ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.06)',
                    color: i === 0 ? '#60a5fa' : '#94a3b8',
                    border: `1px solid ${i === 0 ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </MetricCard>

        {/* Card 3: Skill Gaps */}
        <MetricCard>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-5">Skill Gaps</p>

          <div className="space-y-4 mb-5">
            {topGaps.map((gap, i) => {
              const icons = ['🗄️', '📊', '👥'];
              const subtitles = ['Required for 4 targeted jobs', 'High demand in market', 'Suggested for Senior roles'];
              return (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {icons[i] || '•'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">{gap}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{subtitles[i] || 'Skill gap identified'}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition mt-2"
            onClick={() => onTabChange?.('roadmap')}
          >
            View Full Roadmap
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </MetricCard>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-4">Quick Actions</p>
        <div className="grid md:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => handleTabChange(action.tab)}
                className="text-left rounded-2xl p-5 transition hover:scale-[1.02] active:scale-[0.99] duration-200 group"
                style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: action.bg }}
                >
                  <Icon className="h-5 w-5" style={{ color: action.color }} />
                </div>
                <p className="text-sm font-bold text-white mb-1.5 group-hover:text-blue-300 transition">{action.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{action.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Recent Activity</p>
          <button className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition">
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div
          className="rounded-2xl overflow-hidden divide-y divide-white/5"
          style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {RECENT_ACTIVITY.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{ background: item.iconBg }}
                >
                  <span style={{ color: item.iconColor, fontSize: '14px' }}>{item.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">{item.sub}</p>
                </div>
              </div>
              <span className="text-sm font-bold ml-4 shrink-0" style={item.badgeStyle}>{item.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
