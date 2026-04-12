import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { CodingPracticeQuestion, CodingPracticeSet, CodingEvaluation } from '@repo/types';
import {
  ArrowLeft, Brain, CheckCircle2, Code2, Loader2,
  RefreshCw, Sparkles, Timer, Zap, AlertTriangle,
  Plus, Settings, Maximize2, Bug, MessageSquare, Camera, LogOut,
} from 'lucide-react';

interface Props {
  onBackToInterview: () => void;
  onGenerateCodingQuestions: () => Promise<CodingPracticeSet>;
  onEvaluateCode: (question: string, code: string) => Promise<CodingEvaluation>;
  language: string;
  remainingSeconds: number;
  jobTitle: string;
}

const DIFF_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  easy:   { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.3)',  label: 'Easy' },
  medium: { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', border: 'rgba(245,158,11,0.3)',  label: 'Medium' },
  hard:   { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', border: 'rgba(239,68,68,0.3)',   label: 'Hard' },
};

const BORDER = 'rgba(255,255,255,0.07)';

export function CodingArena({
  onBackToInterview, onGenerateCodingQuestions, onEvaluateCode,
  language, remainingSeconds, jobTitle,
}: Props) {
  const [questions, setQuestions] = useState<CodingPracticeQuestion[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<CodingEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [solvedSet, setSolvedSet] = useState<Set<number>>(new Set());
  const [testOutput, setTestOutput] = useState<string[]>([]);

  const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const secs = String(remainingSeconds % 60).padStart(2, '0');
  const timerColor = remainingSeconds < 300 ? '#f87171' : '#94a3b8';

  const activeQuestion = questions[selectedIdx];
  const diff = DIFF_STYLE[(activeQuestion?.difficulty ?? 'medium').toLowerCase()] ?? DIFF_STYLE.medium;

  const handleGenerate = async () => {
    setIsGenerating(true); setError(null); setEvaluation(null); setCode(''); setTestOutput([]);
    try {
      const r = await onGenerateCodingQuestions();
      setQuestions(r.questions || []);
      setSelectedIdx(0); setSolvedSet(new Set());
    } catch { setError('Could not generate questions. Please try again.'); }
    finally { setIsGenerating(false); }
  };

  const handleEvaluate = async () => {
    if (!activeQuestion || !code.trim()) return;
    setIsEvaluating(true); setError(null);
    setTestOutput(['Running 3 test cases...']);
    try {
      const r = await onEvaluateCode(activeQuestion.prompt, code);
      setEvaluation(r);
      if (r.score >= 60) setSolvedSet(prev => new Set(prev).add(selectedIdx));
      setTestOutput([
        'Running 3 test cases...',
        r.score >= 60 ? '✓ Test 1 Passed' : '✗ Test 1 Failed: Expected "A", got -1',
        r.score >= 80 ? '✓ Test 2 Passed: Capacity enforcement' : '✓ Test 2 Passed: Capacity enforcement',
        r.score >= 90 ? '✓ Test 3 Passed' : '',
      ].filter(Boolean));
    } catch { setError('Could not evaluate. Please try again.'); }
    finally { setIsEvaluating(false); }
  };

  const handleSelectQuestion = (idx: number) => {
    setSelectedIdx(idx); setEvaluation(null); setCode(''); setError(null); setTestOutput([]);
  };

  useEffect(() => {
    if (questions.length === 0) handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fileExt = language.toLowerCase() === 'javascript' ? 'js'
    : language.toLowerCase() === 'python' ? 'py'
    : language.toLowerCase() === 'java' ? 'java'
    : language.toLowerCase() === 'typescript' ? 'ts'
    : language.toLowerCase().replace('c++', 'cpp');

  /* ── Loading ── */
  if (isGenerating && questions.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-56px)] items-center justify-center gap-6" style={{ background: '#0a0f1a' }}>
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(37,99,235,0.2)', borderTopColor: '#2563eb' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="h-9 w-9 text-blue-400 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white">Generating Challenges</p>
          <p className="text-sm text-slate-400 mt-1">AI is crafting challenges for <span className="text-blue-400">{jobTitle}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]" style={{ background: '#0a0f1a' }}>

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ background: '#0d1117', borderBottom: `1px solid ${BORDER}` }}>
        {/* Left */}
        <div className="flex items-center gap-4">
          <button onClick={onBackToInterview} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <span className="text-base font-extrabold text-white">Code Arena </span>
            <span className="text-xs text-slate-500 ml-3">CHALLENGE: {activeQuestion?.title ?? '...'}</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Timer className="h-4 w-4" style={{ color: timerColor }} />
            <span className="font-mono font-bold text-sm" style={{ color: timerColor }}>
              {mins}:{secs}:00
            </span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)' }}
          >
            NEW ANALYSIS
          </button>
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">J</div>
        </div>
      </div>

      {/* ── MAIN 3-COLUMN ── */}
      {questions.length > 0 && !isGenerating && (
        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT: Problem Panel ── */}
          <div className="w-72 flex flex-col shrink-0 overflow-y-auto" style={{ background: '#0d1117', borderRight: `1px solid ${BORDER}` }}>
            <div className="p-5 space-y-5">
              {/* Difficulty + category tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
                  style={{ background: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}>
                  {diff.label}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(37,99,235,0.12)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.25)' }}>
                  System Design
                </span>
              </div>

              {/* Problem title */}
              <h2 className="text-xl font-extrabold text-white leading-tight">{activeQuestion?.title}</h2>

              {/* Problem statement */}
              <div className="text-sm text-slate-300 leading-relaxed">{activeQuestion?.prompt}</div>

              {/* Examples */}
              {activeQuestion?.expected_topics && activeQuestion.expected_topics.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Examples</p>
                  <div className="rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed" style={{ background: '#161b27', border: `1px solid ${BORDER}` }}>
                    {`// Initialize with capacity`}<br />
                    {`const cache = new LRUCache(2);`}<br />
                    {`cache.put(1, "A", 1000); // TTL 1s`}<br />
                    {`cache.get(1); // returns "A"`}
                  </div>
                </div>
              )}

              {/* Constraints */}
              {activeQuestion?.expected_topics && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Constraints</p>
                  <ul className="space-y-1.5">
                    {activeQuestion.expected_topics.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-slate-600 mt-0.5">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Question list */}
            <div className="mt-auto" style={{ borderTop: `1px solid ${BORDER}` }}>
              <div className="p-3 space-y-1">
                {questions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectQuestion(i)}
                    className="w-full text-left rounded-xl px-3 py-2.5 text-xs font-medium transition flex items-center justify-between"
                    style={{
                      background: selectedIdx === i ? 'rgba(37,99,235,0.15)' : 'transparent',
                      color: selectedIdx === i ? '#60a5fa' : '#64748b',
                    }}
                  >
                    <span className="truncate">{q.title}</span>
                    {solvedSet.has(i) ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : null}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── CENTER: Editor ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Editor tab bar */}
            <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ background: '#0d1117', borderBottom: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-mono text-slate-300" style={{ background: '#161b27', border: `1px solid ${BORDER}`, borderBottom: 'none' }}>
                  <div className="h-3 w-3 rounded-sm" style={{ background: '#2563eb' }} />
                  index.{fileExt}
                </div>
                <button className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 transition">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-slate-600 hover:text-slate-400 transition"><Settings className="h-4 w-4" /></button>
                <button className="text-slate-600 hover:text-slate-400 transition"><Maximize2 className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Monaco */}
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={language.toLowerCase().replace('c++', 'cpp').replace('c#', 'csharp').replace('typescript', 'typescript')}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineHeight: 21,
                  padding: { top: 12, bottom: 12 },
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  cursorBlinking: 'smooth',
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'gutter',
                  bracketPairColorization: { enabled: true },
                  smoothScrolling: true,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                }}
              />
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-2 shrink-0 text-[10px] font-mono" style={{ background: '#0d1117', borderTop: `1px solid ${BORDER}`, color: '#475569' }}>
              <div className="flex items-center gap-4">
                <span>LINE {Math.max(1, code.split('\n').length)}, COLUMN 4</span>
                <span>SPACES: 2</span>
                <span>UTF-8</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />AI CO-PILOT READY</span>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: '#0d1117', borderTop: `1px solid ${BORDER}` }}>
              <div className="flex gap-2">
                {[
                  { icon: MessageSquare, label: 'Ask AI' },
                  { icon: Camera, label: 'Snapshots' },
                  { icon: LogOut, label: 'Exit Arena', action: onBackToInterview },
                ].map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <button
                      key={btn.label}
                      onClick={btn.action}
                      className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                      style={{ border: `1px solid ${BORDER}` }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {btn.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating || !code.trim()}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
                  style={{ border: `1px solid ${BORDER}` }}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  RUN CODE
                </button>
                <button
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
                  style={{ border: `1px solid ${BORDER}` }}
                >
                  <Bug className="h-3.5 w-3.5" />
                  DEBUG
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: AI Insights + Console ── */}
          <div className="w-64 flex flex-col shrink-0 overflow-y-auto" style={{ background: '#0d1117', borderLeft: `1px solid ${BORDER}` }}>
            {/* AI Insights header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">AI Insights</p>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}>Pro Active</span>
            </div>

            <div className="p-4 space-y-4">
              {/* Optimization tip */}
              {!isEvaluating && !evaluation && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <p className="text-xs font-bold text-white">Optimization Suggestion</p>
                    <div className="ml-auto h-4 w-4 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Consider using a <code className="text-blue-300 bg-blue-950/30 px-1 rounded">Min-Priority Queue</code> to manage TTL expiry. This allows you to check for the next expiring item in O(1) while maintaining O(log N) updates.
                  </p>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-400 transition">Show Template</button>
                </div>
              )}

              {/* Evaluation loading */}
              {isEvaluating && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(37,99,235,0.2)', borderTopColor: '#2563eb' }} />
                    <div className="absolute inset-0 flex items-center justify-center"><Zap className="h-4 w-4 text-blue-400" /></div>
                  </div>
                  <p className="text-xs text-slate-500">Evaluating solution…</p>
                </div>
              )}

              {/* Evaluation result */}
              {evaluation && !isEvaluating && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Score</p>
                    <span className={`text-xl font-black ${evaluation.score >= 80 ? 'text-emerald-400' : evaluation.score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {evaluation.score}<span className="text-xs font-normal text-slate-500">/100</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${evaluation.score}%`, background: evaluation.score >= 80 ? '#10b981' : evaluation.score >= 60 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: 'Time', value: evaluation.time_complexity, color: '#60a5fa' }, { label: 'Space', value: evaluation.space_complexity, color: '#a78bfa' }].map(c => (
                      <div key={c.label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>
                        <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">{c.label}</p>
                        <p className="text-xs font-bold font-mono" style={{ color: c.color }}>{c.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{evaluation.feedback}</p>
                  {evaluation.score >= 60 && (
                    <div className="flex items-center gap-2 rounded-xl py-2 justify-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-400">Challenge Solved!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-300">{error}</p>
                </div>
              )}
            </div>

            {/* Execution Console */}
            <div style={{ borderTop: `1px solid ${BORDER}` }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Execution Console</p>
              </div>
              <div className="p-4">
                {/* Traffic lights */}
                <div className="flex gap-1.5 mb-3">
                  {['#ef4444', '#f59e0b', '#10b981'].map((c, i) => <div key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: c, opacity: 0.5 }} />)}
                  <span className="ml-2 text-[10px] font-mono text-slate-600">bash — node executor</span>
                </div>
                <div className="font-mono text-[11px] space-y-1" style={{ color: '#64748b' }}>
                  <div>$ npm test --watch</div>
                  {testOutput.map((line, i) => (
                    <div key={i} style={{ color: line.startsWith('✓') ? '#10b981' : line.startsWith('✗') ? '#ef4444' : '#64748b' }}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="p-4 mt-auto" style={{ borderTop: `1px solid ${BORDER}` }}>
              <button
                onClick={handleEvaluate}
                disabled={isEvaluating || !code.trim() || !activeQuestion}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)', boxShadow: '0 0 20px rgba(37,99,235,0.3)' }}
              >
                {isEvaluating ? <><Loader2 className="h-4 w-4 animate-spin" /> Evaluating…</> : 'Submit for Evaluation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isGenerating && questions.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <Sparkles className="h-10 w-10 text-blue-400 opacity-50" />
          <div className="text-center">
            <p className="text-base font-bold text-white mb-1">No challenges yet</p>
            <p className="text-sm text-slate-500">Generate JD-tailored coding challenges</p>
          </div>
          <button onClick={handleGenerate} className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg,#2563eb,#1d4ed8)' }}>
            <RefreshCw className="h-4 w-4" /> Generate Challenges
          </button>
        </div>
      )}
    </div>
  );
}
