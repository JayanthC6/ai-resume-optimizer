import { useState } from 'react';
import { Mic, MessageSquare, Play, Code2, Briefcase, ChevronDown, Lock, Shield, BarChart2, RefreshCw, X } from 'lucide-react';
import type { InterviewDurationRecommendation } from '@repo/types';

interface Props {
  onStart: (config: { mode: string; language: string; voiceEnabled: boolean; durationMinutes: number }) => void;
  onGetRecommendation: (payload: { mode: string; language: string }) => Promise<void>;
  recommendation: InterviewDurationRecommendation | null;
  recommendationLoading?: boolean;
  isLoading?: boolean;
}

const MODES = [
  { id: 'Behavioral', title: 'Behavioral', icon: MessageSquare, desc: 'Focus on leadership, soft skills, and cultural alignment principles.' },
  { id: 'Technical', title: 'Technical', icon: Code2, desc: 'Deep dive into algorithms, system design, and live coding challenges.' },
  { id: 'Mixed', title: 'Mixed', icon: Briefcase, desc: 'A balanced session covering behavioral and technical competencies.' },
];

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'SQL', 'English (US)', 'English (UK)'];

const CARD_BG = '#161b27';
const BORDER = 'rgba(255,255,255,0.07)';

export function InterviewSetupPanel({ onStart, isLoading, onGetRecommendation, recommendation, recommendationLoading }: Props) {
  const [mode, setMode] = useState('Behavioral');
  const [language, setLanguage] = useState('English (US)');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <div className="space-y-8 pb-10">

      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Mock Interview</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Simulation Environment Setup</p>
      </div>

      {/* ── STEP 01: Configure Session ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-2">Step 01</p>
        <h2 className="text-2xl font-extrabold text-white mb-6">Configure Your Session</h2>

        <div className="grid grid-cols-3 gap-4">
          {/* Interview Mode */}
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Interview Mode</p>
            <div className="relative">
              <button
                onClick={() => {
                  const idx = MODES.findIndex(m => m.id === mode);
                  setMode(MODES[(idx + 1) % MODES.length].id);
                }}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-lg font-bold text-white">{mode}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {MODES.find(m => m.id === mode)?.desc}
            </p>
          </div>

          {/* Language */}
          <div className="rounded-2xl p-5 relative" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 21C12 21 3 15 3 9a9 9 0 1118 0c0 6-9 12-9 12z"/><circle cx="12" cy="9" r="3"/>
              </svg>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Language</p>
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setLangOpen(!langOpen)}
            >
              <span className="text-lg font-bold text-white">{language}</span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
            <p className="text-xs text-slate-500 mt-2">Natural NLP processing in your choice of professional dialect.</p>
            {langOpen && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl overflow-hidden shadow-xl" style={{ background: '#1a2035', border: `1px solid ${BORDER}` }}>
                {LANGUAGES.map(l => (
                  <button key={l} className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 transition" onClick={() => { setLanguage(l); setLangOpen(false); }}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Method */}
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Mic className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Input Method</p>
            <div className="flex gap-2">
              <button
                onClick={() => setVoiceEnabled(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition"
                style={{
                  background: voiceEnabled ? 'linear-gradient(90deg,#2563eb,#1d4ed8)' : 'rgba(255,255,255,0.04)',
                  color: voiceEnabled ? 'white' : '#64748b',
                  border: voiceEnabled ? 'none' : `1px solid ${BORDER}`,
                }}
              >
                <Mic className="h-3.5 w-3.5" /> Voice
              </button>
              <button
                onClick={() => setVoiceEnabled(false)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition"
                style={{
                  background: !voiceEnabled ? 'linear-gradient(90deg,#2563eb,#1d4ed8)' : 'rgba(255,255,255,0.04)',
                  color: !voiceEnabled ? 'white' : '#64748b',
                  border: !voiceEnabled ? 'none' : `1px solid ${BORDER}`,
                }}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
                Text
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">Recommended for real-time stress testing and tone analysis.</p>
          </div>
        </div>
      </div>

      {/* ── STEP 02: AI Interviewer ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-2">Step 02</p>
        <h2 className="text-2xl font-extrabold text-white mb-6">AI Interviewer Recommendation</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: rationale */}
          <div className="flex flex-col justify-center">
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Based on your target role:{' '}
              <strong className="text-white">Senior Product Designer</strong>. We've synthesized a profile optimised to challenge your specific portfolio gaps.
            </p>
            {recommendation && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
                <span className="text-sm text-blue-300">Recommended: <strong>{recommendation.recommended_minutes} min</strong> — {recommendation.rationale}</span>
              </div>
            )}
            <button
              onClick={() => onGetRecommendation({ mode, language })}
              disabled={recommendationLoading}
              className="mt-4 flex items-center gap-2 w-fit text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${recommendationLoading ? 'animate-spin' : ''}`} />
              {recommendationLoading ? 'Getting recommendation…' : 'Get Duration Recommendation'}
            </button>
          </div>

          {/* Right: Persona card */}
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-20 w-20 rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="h-full w-full flex items-center justify-center text-4xl">🤖</div>
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest" style={{ background: '#f59e0b', color: '#000' }}>EXPERT</span>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Persona:</p>
                    <h3 className="text-lg font-bold text-white">"Elena V."</h3>
                  </div>
                  <div className="flex gap-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: 'rgba(37,99,235,0.2)', color: '#60a5fa' }}>DESIGN</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: 'rgba(37,99,235,0.12)', color: '#60a5fa' }}>LEADER AI</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic leading-relaxed mb-3">
                  "Elena specialises in probing visual hierarchy logic and cross-functional collaboration strategies. Expect direct, high-stakes feedback."
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {['PORTFOLIO DEEP DIVE', 'SYSTEM THINKING', 'CONFLICT RES'].map(t => (
                    <span key={t} className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: `1px solid ${BORDER}` }}>{t}</span>
                  ))}
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition">
                  <RefreshCw className="h-3 w-3" /> Change Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ready to Begin ── */}
      <div
        className="rounded-2xl p-10 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0d1420,#101828)', border: '1px solid rgba(37,99,235,0.2)' }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center,rgba(37,99,235,0.07),transparent 70%)' }} />
        <h2 className="text-4xl font-extrabold text-white mb-3">Ready to begin?</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
          The simulation will last approximately 20 minutes. Ensure your microphone is connected and you are in a quiet environment.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => onStart({ mode, language, voiceEnabled, durationMinutes: recommendation?.recommended_minutes ?? 20 })}
            disabled={isLoading}
            className="flex items-center gap-3 rounded-xl px-8 py-4 text-base font-bold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)', boxShadow: '0 0 40px rgba(37,99,235,0.35)' }}
          >
            {isLoading ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Preparing Room…</> : <>Enter Simulation <Play className="h-5 w-5 fill-current" /></>}
          </button>
          <button className="flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold text-slate-300 transition hover:bg-white/5" style={{ border: `1px solid ${BORDER}` }}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            Test Hardware
          </button>
        </div>
        <div className="flex items-center justify-center gap-6 mt-6 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Private Session</span>
          <span className="flex items-center gap-1.5"><BarChart2 className="h-3 w-3" /> Real-Time Insights</span>
        </div>
      </div>
    </div>
  );
}
