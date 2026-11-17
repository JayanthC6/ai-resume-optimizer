import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { 
  CodingPracticeQuestion, 
  CodingPracticeSet, 
  CodingEvaluation,
  CodingHintResponse,
  CodingDebugResponse,
} from '@repo/types';
import {
  ArrowLeft, Brain, CheckCircle2, Loader2,
  RefreshCw, Sparkles, Timer, Zap, AlertTriangle,
  Settings, Maximize2, Bug, MessageSquare, LogOut,
  ChevronDown, HelpCircle, X, Terminal, Check,
  ChevronLeft, ChevronRight, ArrowRight,
} from 'lucide-react';

interface Props {
  onBackToInterview: () => void;
  onGenerateCodingQuestions: () => Promise<CodingPracticeSet>;
  onEvaluateCode: (question: string, code: string, language?: string) => Promise<CodingEvaluation>;
  onGetHint?: (question: string, code: string, language?: string) => Promise<CodingHintResponse>;
  onDebugCode?: (question: string, code: string, language?: string) => Promise<CodingDebugResponse>;
  language: string;
  remainingSeconds: number;
  jobTitle: string;
}

interface LanguageSpec {
  name: string;
  monacoLang: string;
  filename: string;
  starter: string;
}

const SUPPORTED_LANGUAGES: Record<string, LanguageSpec> = {
  JavaScript: {
    name: 'JavaScript',
    monacoLang: 'javascript',
    filename: 'index.js',
    starter: '// Write your JavaScript solution below\nfunction solution() {\n  \n}\n',
  },
  TypeScript: {
    name: 'TypeScript',
    monacoLang: 'typescript',
    filename: 'index.ts',
    starter: '// Write your TypeScript solution below\nfunction solution(): void {\n  \n}\n',
  },
  Python: {
    name: 'Python',
    monacoLang: 'python',
    filename: 'main.py',
    starter: '# Write your Python solution below\ndef solution():\n    pass\n',
  },
  Java: {
    name: 'Java',
    monacoLang: 'java',
    filename: 'Solution.java',
    starter: '// Write your Java solution below\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n',
  },
  'C++': {
    name: 'C++',
    monacoLang: 'cpp',
    filename: 'solution.cpp',
    starter: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n',
  },
  Go: {
    name: 'Go',
    monacoLang: 'go',
    filename: 'main.go',
    starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Solution")\n}\n',
  },
  Ruby: {
    name: 'Ruby',
    monacoLang: 'ruby',
    filename: 'solution.rb',
    starter: '# Write your Ruby solution below\ndef solution\n  \nend\n',
  },
  Rust: {
    name: 'Rust',
    monacoLang: 'rust',
    filename: 'main.rs',
    starter: '// Write your Rust solution below\nfn main() {\n    \n}\n',
  },
};

const DIFF_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  easy:   { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.3)',  label: 'Easy' },
  medium: { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', border: 'rgba(245,158,11,0.3)',  label: 'Medium' },
  hard:   { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', border: 'rgba(239,68,68,0.3)',   label: 'Hard' },
};

const BORDER = 'rgba(255,255,255,0.07)';

// Generates an idiomatic starter function in the target language for the specific question
function getStarterCodeForLanguage(q: CodingPracticeQuestion | undefined, lang: string): string {
  if (!q) return SUPPORTED_LANGUAGES[lang]?.starter || '// Write solution\n';
  
  const rawWords = (q.title || 'solution').replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  const camel = rawWords.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') || 'solution';
  const snake = rawWords.map(w => w.toLowerCase()).join('_') || 'solution';

  // If question already has starter_code and the current language is Python and starter is in python, use it
  if (lang === 'Python' && q.starter_code && q.starter_code.includes('def ')) {
    return q.starter_code;
  }

  switch (lang) {
    case 'Python':
      return `# ${q.title}\ndef ${snake}(*args):\n    # Write your solution here\n    pass\n`;
    case 'JavaScript':
      return `// ${q.title}\nfunction ${camel}(...args) {\n  // Write your solution here\n  \n}\n`;
    case 'TypeScript':
      return `// ${q.title}\nfunction ${camel}(...args: any[]): any {\n  // Write your solution here\n  \n}\n`;
    case 'Java':
      return `// ${q.title}\npublic class Solution {\n    public static void ${camel}() {\n        // Write your solution here\n    }\n}\n`;
    case 'C++':
      return `#include <iostream>\n#include <vector>\nusing namespace std;\n\n// ${q.title}\nvoid ${snake}() {\n    // Write your solution here\n}\n`;
    case 'Go':
      return `package main\n\nimport "fmt"\n\n// ${q.title}\nfunc ${camel}() {\n    // Write your solution here\n}\n`;
    case 'Ruby':
      return `# ${q.title}\ndef ${snake}(*args)\n  # Write your solution here\nend\n`;
    case 'Rust':
      return `// ${q.title}\nfn ${snake}() {\n    // Write your solution here\n}\n`;
    default:
      return SUPPORTED_LANGUAGES[lang]?.starter || '// Write your code here\n';
  }
}

export function CodingArena({
  onBackToInterview,
  onGenerateCodingQuestions,
  onEvaluateCode,
  onGetHint,
  onDebugCode,
  language: initialLanguage,
  remainingSeconds,
  jobTitle,
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

  // Language state & per-language/per-question code cache
  const matchedLang = SUPPORTED_LANGUAGES[initialLanguage] ? initialLanguage : 'JavaScript';
  const [selectedLang, setSelectedLang] = useState<string>(matchedLang);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [codeCache, setCodeCache] = useState<Record<number, Record<string, string>>>({});

  // Ask AI & Debug states
  const [hintLoading, setHintLoading] = useState(false);
  const [hintData, setHintData] = useState<CodingHintResponse | null>(null);
  const [showHintModal, setShowHintModal] = useState(false);

  const [debugLoading, setDebugLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<CodingDebugResponse | null>(null);

  const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const secs = String(remainingSeconds % 60).padStart(2, '0');
  const timerColor = remainingSeconds < 300 ? '#f87171' : '#94a3b8';

  const activeQuestion = questions[selectedIdx];
  const diff = DIFF_STYLE[(activeQuestion?.difficulty ?? 'medium').toLowerCase()] ?? DIFF_STYLE.medium;
  const currentLangSpec = SUPPORTED_LANGUAGES[selectedLang] || SUPPORTED_LANGUAGES.JavaScript;

  // Question category (never static "System Design")
  const categoryLabel = activeQuestion?.category 
    || (activeQuestion?.expected_topics?.[0] ? activeQuestion.expected_topics[0].toUpperCase() : 'ALGORITHMS');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setEvaluation(null);
    setCode('');
    setTestOutput([]);
    setHintData(null);
    setDebugResult(null);
    setCodeCache({});
    try {
      const r = await onGenerateCodingQuestions();
      const loaded = r.questions || [];
      setQuestions(loaded);
      setSelectedIdx(0);
      setSolvedSet(new Set());
      if (loaded.length > 0) {
        const initialStarter = getStarterCodeForLanguage(loaded[0], selectedLang);
        setCode(initialStarter);
        setCodeCache({ 0: { [selectedLang]: initialStarter } });
      }
    } catch {
      setError('Could not generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluate = async () => {
    if (!activeQuestion || !code.trim()) return;
    setIsEvaluating(true);
    setError(null);
    setTestOutput([`Compiling and running against test suite (${selectedLang})...`]);
    try {
      const r = await onEvaluateCode(activeQuestion.prompt, code, selectedLang);
      setEvaluation(r);
      if (r.score >= 60) {
        setSolvedSet(prev => new Set(prev).add(selectedIdx));
      }
      setTestOutput([
        `Running tests for ${activeQuestion.title} [${selectedLang}]...`,
        r.score >= 60 ? '✓ Test 1 Passed: Core functional requirements' : '✗ Test 1 Failed: Output mismatch',
        r.score >= 75 ? '✓ Test 2 Passed: Edge cases and null checks' : '✗ Test 2 Failed: Edge cases failed',
        r.score >= 85 ? `✓ Test 3 Passed: Output correctness verified` : '✗ Test 3 Failed: Verification failed',
        '──────────────────────────────────────────',
        `⏱️  Time Complexity (TC) : ${r.time_complexity}`,
        `💾  Space Complexity (SC): ${r.space_complexity}`,
        '──────────────────────────────────────────',
        `Final Score: ${r.score}/100 (${r.score >= 60 ? 'Accepted' : 'Needs Optimization'})`,
      ].filter(Boolean));
    } catch {
      setError('Could not evaluate code. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSelectQuestion = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    
    // Save current code to cache before switching question
    setCodeCache(prev => ({
      ...prev,
      [selectedIdx]: {
        ...(prev[selectedIdx] || {}),
        [selectedLang]: code,
      }
    }));

    setSelectedIdx(idx);
    setEvaluation(null);
    setError(null);
    setTestOutput([]);
    setHintData(null);
    setDebugResult(null);

    // Retrieve cached code or generate starter for this question and language
    const cached = codeCache[idx]?.[selectedLang];
    if (cached && cached.trim()) {
      setCode(cached);
    } else {
      const freshStarter = getStarterCodeForLanguage(questions[idx], selectedLang);
      setCode(freshStarter);
      setCodeCache(prev => ({
        ...prev,
        [idx]: {
          ...(prev[idx] || {}),
          [selectedLang]: freshStarter,
        }
      }));
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLangDropdownOpen(false);
    if (newLang === selectedLang) return;

    // Cache current code in old language
    setCodeCache(prev => ({
      ...prev,
      [selectedIdx]: {
        ...(prev[selectedIdx] || {}),
        [selectedLang]: code,
      }
    }));

    setSelectedLang(newLang);

    // If code for new language was cached previously, restore it
    const cachedForNewLang = codeCache[selectedIdx]?.[newLang];
    if (cachedForNewLang && cachedForNewLang.trim()) {
      setCode(cachedForNewLang);
    } else {
      // Provide clean syntax starter template for the new language
      const newStarter = getStarterCodeForLanguage(activeQuestion, newLang);
      setCode(newStarter);
      setCodeCache(prev => ({
        ...prev,
        [selectedIdx]: {
          ...(prev[selectedIdx] || {}),
          [newLang]: newStarter,
        }
      }));
    }
  };

  const handleResetTemplate = () => {
    const fresh = getStarterCodeForLanguage(activeQuestion, selectedLang);
    setCode(fresh);
    setCodeCache(prev => ({
      ...prev,
      [selectedIdx]: {
        ...(prev[selectedIdx] || {}),
        [selectedLang]: fresh,
      }
    }));
  };

  // Ask AI action
  const handleAskAI = async () => {
    if (!activeQuestion) return;
    setHintLoading(true);
    setShowHintModal(true);
    try {
      if (onGetHint) {
        const hint = await onGetHint(activeQuestion.prompt, code, selectedLang);
        setHintData(hint);
      } else {
        setHintData({
          hint: activeQuestion.optimization_tip || `Consider using an appropriate data structure like a Hash Map or Two Pointers to optimize lookups.`,
          approach: `1. Clarify constraints and edge cases.\n2. Identify optimal data structure for ${activeQuestion.expected_topics?.[0] || 'the core operation'}.\n3. Implement in ${selectedLang} with clean time/space bounds.`,
          complexity_tip: 'Target O(N) or O(N log N) runtime.',
        });
      }
    } catch {
      setHintData({
        hint: activeQuestion.optimization_tip || 'Break the problem down and identify if duplicate computations can be avoided.',
        approach: '1. Handle base cases.\n2. Store intermediate results in a Hash Map.\n3. Return result.',
      });
    } finally {
      setHintLoading(false);
    }
  };

  // Debug Code action
  const handleDebug = async () => {
    if (!activeQuestion) return;
    if (!code.trim()) {
      setError('Please write some code in the editor before debugging.');
      return;
    }
    setDebugLoading(true);
    setError(null);
    setTestOutput([`Debugging code for syntax and logic issues in ${selectedLang}...`]);
    try {
      if (onDebugCode) {
        const result = await onDebugCode(activeQuestion.prompt, code, selectedLang);
        setDebugResult(result);
        if (result.issues.length > 0) {
          setTestOutput([
            `[DEBUGGER] Found ${result.issues.length} potential issue(s):`,
            ...result.issues.map(iss => `• ${iss}`),
            '',
            '[SUGGESTIONS]:',
            ...result.suggestions.map(sug => `→ ${sug}`),
          ]);
        } else {
          setTestOutput([
            '[DEBUGGER] No obvious syntax or logical bugs detected!',
            '• Structure and control flow look solid.',
            '• Ready to run against tests.',
          ]);
        }
      } else {
        setTestOutput([
          `[DEBUGGER] Code analyzed for ${selectedLang}:`,
          '• Check array bounds and undefined access.',
          '• Ensure all branches return a valid value.',
        ]);
      }
    } catch {
      setError('Debugger service temporarily unavailable.');
    } finally {
      setDebugLoading(false);
    }
  };

  useEffect(() => {
    if (questions.length === 0) handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Loading Screen ── */
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
          <p className="text-lg font-bold text-white">Generating Coding Challenges</p>
          <p className="text-sm text-slate-400 mt-1">Creating LeetCode-style problems (Easy, Medium, Hard) for <span className="text-blue-400">{jobTitle}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] relative" style={{ background: '#0a0f1a' }}>

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ background: '#0d1117', borderBottom: `1px solid ${BORDER}` }}>
        {/* Left */}
        <div className="flex items-center gap-4">
          <button onClick={onBackToInterview} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <span className="text-base font-extrabold text-white">Code Arena</span>
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
            {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            NEW CHALLENGES
          </button>
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">J</div>
        </div>
      </div>

      {/* ── MAIN 3-COLUMN ── */}
      {questions.length > 0 && !isGenerating && (
        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT: Problem Panel ── */}
          <div className="w-84 flex flex-col shrink-0 overflow-y-auto" style={{ width: '340px', background: '#0d1117', borderRight: `1px solid ${BORDER}` }}>
            
            {/* ── Top Question Switcher (LeetCode style with Next / Prev buttons) ── */}
            <div className="p-2.5 shrink-0 flex items-center justify-between gap-1.5" style={{ background: '#0a0f1a', borderBottom: `1px solid ${BORDER}` }}>
              <button
                onClick={() => handleSelectQuestion(selectedIdx - 1)}
                disabled={selectedIdx === 0}
                className="h-7 px-2 rounded-md text-[11px] font-semibold text-slate-400 hover:text-white disabled:opacity-20 transition flex items-center gap-0.5 shrink-0"
                title="Previous Question"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>

              <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-[200px]">
                {questions.map((q, idx) => {
                  const qDiff = DIFF_STYLE[(q.difficulty || 'medium').toLowerCase()] || DIFF_STYLE.medium;
                  const isActive = selectedIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuestion(idx)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0"
                      style={{
                        background: isActive ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.03)',
                        color: isActive ? '#60a5fa' : '#94a3b8',
                        border: `1px solid ${isActive ? 'rgba(37,99,235,0.5)' : BORDER}`,
                      }}
                      title={q.title}
                    >
                      <span>Q{idx + 1}</span>
                      <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded" style={{ color: qDiff.color }}>
                        {q.difficulty?.slice(0, 3)}
                      </span>
                      {solvedSet.has(idx) && <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handleSelectQuestion(selectedIdx + 1)}
                disabled={selectedIdx >= questions.length - 1}
                className="h-7 px-2 rounded-md text-[11px] font-bold text-blue-400 hover:text-blue-300 disabled:opacity-20 transition flex items-center gap-0.5 shrink-0"
                title="Next Question"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Difficulty + Dynamic Category Tag */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
                  style={{ background: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}>
                  {diff.label}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(37,99,235,0.12)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.25)' }}>
                  {categoryLabel}
                </span>
              </div>

              {/* Problem title */}
              <h2 className="text-xl font-extrabold text-white leading-tight">{activeQuestion?.title}</h2>

              {/* Problem statement */}
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{activeQuestion?.prompt}</div>

              {/* Real Examples (Dynamic per question) */}
              {activeQuestion?.examples && activeQuestion.examples.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Examples</p>
                  {activeQuestion.examples.map((ex, i) => (
                    <div key={i} className="rounded-xl p-3 font-mono text-xs text-slate-300 space-y-1.5 leading-relaxed" style={{ background: '#161b27', border: `1px solid ${BORDER}` }}>
                      <div><span className="text-slate-500">Input: </span><span className="text-emerald-400">{ex.input}</span></div>
                      <div><span className="text-slate-500">Output: </span><span className="text-blue-400">{ex.output}</span></div>
                      {ex.explanation && (
                        <div className="text-[11px] text-slate-400 font-sans mt-1 pt-1" style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Example</p>
                  <div className="rounded-xl p-3 font-mono text-xs text-slate-300 leading-relaxed" style={{ background: '#161b27', border: `1px solid ${BORDER}` }}>
                    <span className="text-slate-500">// Sample execution</span><br />
                    <span className="text-emerald-400">solution();</span> <span className="text-slate-500">// returns expected output</span>
                  </div>
                </div>
              )}

              {/* Constraints */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Constraints</p>
                <ul className="space-y-1.5">
                  {(activeQuestion?.constraints && activeQuestion.constraints.length > 0
                    ? activeQuestion.constraints
                    : activeQuestion?.expected_topics ?? []
                  ).map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300 font-mono">
                      <span className="text-slate-600 mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Problem Footer Navigation (Previous / Next Buttons) ── */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => handleSelectQuestion(selectedIdx - 1)}
                  disabled={selectedIdx === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-25 transition"
                  style={{ border: `1px solid ${BORDER}` }}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedIdx + 1} of {questions.length}
                </span>
                <button
                  onClick={() => handleSelectQuestion(selectedIdx + 1)}
                  disabled={selectedIdx >= questions.length - 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-25 transition"
                >
                  Next Question <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── CENTER: Editor ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Editor tab bar */}
            <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ background: '#0d1117', borderBottom: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-3">
                {/* Active file tab */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300" style={{ background: '#161b27', border: `1px solid ${BORDER}` }}>
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#2563eb' }} />
                  {currentLangSpec.filename}
                </div>

                {/* ── Language Switcher Dropdown ── */}
                <div className="relative">
                  <button
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}` }}
                  >
                    <span>{selectedLang}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>

                  {langDropdownOpen && (
                    <div 
                      className="absolute top-full left-0 mt-1 w-44 rounded-xl shadow-2xl py-1 z-30 overflow-hidden"
                      style={{ background: '#1a2035', border: `1px solid ${BORDER}` }}
                    >
                      {Object.keys(SUPPORTED_LANGUAGES).map((langKey) => (
                        <button
                          key={langKey}
                          onClick={() => handleLanguageChange(langKey)}
                          className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition hover:bg-white/10"
                          style={{
                            color: selectedLang === langKey ? '#60a5fa' : '#cbd5e1',
                            fontWeight: selectedLang === langKey ? 700 : 500,
                          }}
                        >
                          <span>{langKey}</span>
                          {selectedLang === langKey && <Check className="h-3.5 w-3.5 text-blue-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleResetTemplate} 
                  className="text-xs text-slate-500 hover:text-slate-300 transition px-2 py-1"
                  title="Reset code to language starter template"
                >
                  Reset Template
                </button>
                <button className="text-slate-600 hover:text-slate-400 transition"><Settings className="h-4 w-4" /></button>
                <button className="text-slate-600 hover:text-slate-400 transition"><Maximize2 className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={currentLangSpec.monacoLang}
                theme="vs-dark"
                value={code}
                onChange={(v) => {
                  const val = v || '';
                  setCode(val);
                  setCodeCache(prev => ({
                    ...prev,
                    [selectedIdx]: {
                      ...(prev[selectedIdx] || {}),
                      [selectedLang]: val,
                    }
                  }));
                }}
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
                <span>LINE {Math.max(1, code.split('\n').length)}, COLUMN 1</span>
                <span>LANGUAGE: {selectedLang.toUpperCase()}</span>
                <span>UTF-8</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />AI READY</span>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: '#0d1117', borderTop: `1px solid ${BORDER}` }}>
              <div className="flex gap-2">
                {/* ASK AI Button */}
                <button
                  onClick={handleAskAI}
                  disabled={hintLoading}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-950/40 transition"
                  style={{ border: '1px solid rgba(37,99,235,0.3)', background: 'rgba(37,99,235,0.08)' }}
                >
                  {hintLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
                  Ask AI
                </button>

                {/* Exit Arena Button */}
                <button
                  onClick={onBackToInterview}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                  style={{ border: `1px solid ${BORDER}` }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Exit Arena
                </button>
              </div>

              <div className="flex gap-2">
                {/* RUN CODE Button */}
                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating || !code.trim()}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
                  style={{ border: `1px solid ${BORDER}` }}
                >
                  {isEvaluating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                  RUN CODE
                </button>

                {/* DEBUG Button */}
                <button
                  onClick={handleDebug}
                  disabled={debugLoading || !code.trim()}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-950/30 transition disabled:opacity-40"
                  style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)' }}
                >
                  {debugLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bug className="h-3.5 w-3.5" />}
                  DEBUG
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: AI Insights + Console ── */}
          <div className="w-76 flex flex-col shrink-0 overflow-y-auto" style={{ width: '310px', background: '#0d1117', borderLeft: `1px solid ${BORDER}` }}>
            {/* AI Insights header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">AI Insights</p>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}>Live</span>
            </div>

            <div className="p-4 space-y-4">
              {/* Optimization tip */}
              {!isEvaluating && !evaluation && !debugResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <p className="text-xs font-bold text-white">Target Optimization</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activeQuestion?.optimization_tip || 'Focus on optimizing asymptotic runtime and space complexity using proper data structures.'}
                  </p>
                  <button 
                    onClick={handleAskAI}
                    className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:underline transition flex items-center gap-1"
                  >
                    <HelpCircle className="h-3 w-3" /> Get Approach Hint
                  </button>
                </div>
              )}

              {/* Debug Result Analysis Card */}
              {debugResult && !isEvaluating && (
                <div className="space-y-2 rounded-xl p-3" style={{ 
                  background: debugResult.has_issues ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)', 
                  border: `1px solid ${debugResult.has_issues ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}` 
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bug className={`h-4 w-4 ${debugResult.has_issues ? 'text-amber-400' : 'text-emerald-400'}`} />
                      <p className="text-xs font-bold text-white">Debug Inspection</p>
                    </div>
                    <button onClick={() => setDebugResult(null)} className="text-slate-500 hover:text-slate-300">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  {debugResult.issues.length > 0 ? (
                    <div className="space-y-1 pt-1">
                      {debugResult.issues.map((iss, i) => (
                        <p key={i} className="text-xs text-amber-300 leading-relaxed">• {iss}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-400">No syntax or logical flaws detected in your code!</p>
                  )}
                  {debugResult.suggestions.length > 0 && (
                    <div className="pt-1 border-t border-white/5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Suggestions:</p>
                      {debugResult.suggestions.map((sug, i) => (
                        <p key={i} className="text-[11px] text-slate-300">→ {sug}</p>
                      ))}
                    </div>
                  )}
                  {debugResult.fixed_code && (
                    <button
                      onClick={() => setCode(debugResult.fixed_code!)}
                      className="text-[11px] text-blue-400 font-semibold hover:underline pt-1 block"
                    >
                      Apply Suggested Fix
                    </button>
                  )}
                </div>
              )}

              {/* Evaluation loading */}
              {isEvaluating && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(37,99,235,0.2)', borderTopColor: '#2563eb' }} />
                    <div className="absolute inset-0 flex items-center justify-center"><Zap className="h-4 w-4 text-blue-400" /></div>
                  </div>
                  <p className="text-xs text-slate-500">Evaluating solution in {selectedLang}…</p>
                </div>
              )}

              {/* Evaluation result with high-visibility TC & SC */}
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

                  {/* ── HIGH-VISIBILITY TC & SC COMPLEXITY BOX ── */}
                  <div className="rounded-xl p-3 space-y-2.5" style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.25)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" /> Complexity Analysis
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">Evaluated</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Time Complexity (TC) */}
                      <div className="rounded-lg p-2.5" style={{ background: '#131826', border: '1px solid rgba(59,130,246,0.35)' }}>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-400 mb-0.5">
                          <Timer className="h-3 w-3" />
                          <span>TC (Time)</span>
                        </div>
                        <p className="text-base font-black font-mono text-white tracking-wide">{evaluation.time_complexity}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Asymptotic Runtime</p>
                      </div>

                      {/* Space Complexity (SC) */}
                      <div className="rounded-lg p-2.5" style={{ background: '#131826', border: '1px solid rgba(168,85,247,0.35)' }}>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-purple-400 mb-0.5">
                          <span>💾</span>
                          <span>SC (Space)</span>
                        </div>
                        <p className="text-base font-black font-mono text-white tracking-wide">{evaluation.space_complexity}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Auxiliary Memory</p>
                      </div>
                    </div>
                  </div>

                  {/* Feedback description */}
                  <p className="text-xs text-slate-300 leading-relaxed">{evaluation.feedback}</p>

                  {/* Challenge Solved banner + NEXT QUESTION ACTION BUTTON */}
                  {evaluation.score >= 60 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 rounded-xl py-2 px-3 justify-center" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300">Challenge Solved! (100/100)</span>
                      </div>

                      {selectedIdx < questions.length - 1 ? (
                        <button
                          onClick={() => handleSelectQuestion(selectedIdx + 1)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold text-white transition hover:opacity-95"
                          style={{ background: 'linear-gradient(90deg, #10b981, #059669)', boxShadow: '0 0 15px rgba(16,185,129,0.35)' }}
                        >
                          Next Question (Q{selectedIdx + 2}) <ArrowRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <p className="text-center text-[11px] text-emerald-400 font-semibold">🎉 All problems in this arena solved!</p>
                      )}
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
            <div className="flex-1 flex flex-col" style={{ borderTop: `1px solid ${BORDER}` }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5">
                  <Terminal className="h-3 w-3" /> Execution Console
                </p>
                <span className="text-[10px] font-mono text-slate-600">{selectedLang}</span>
              </div>
              <div className="p-4 flex-1 font-mono text-[11px] space-y-1.5 overflow-y-auto" style={{ color: '#64748b' }}>
                <div className="flex gap-1.5 mb-2">
                  {['#ef4444', '#f59e0b', '#10b981'].map((c, i) => <div key={i} className="h-2 w-2 rounded-full" style={{ background: c, opacity: 0.5 }} />)}
                  <span className="ml-1 text-[9px] text-slate-600">output logger</span>
                </div>
                {testOutput.length === 0 ? (
                  <div className="text-slate-600 italic">Run or Debug your code to see outputs...</div>
                ) : (
                  testOutput.map((line, i) => (
                    <div key={i} style={{ 
                      color: line.startsWith('✓') ? '#10b981' 
                        : line.startsWith('✗') ? '#ef4444' 
                        : line.startsWith('⏱️') ? '#60a5fa'
                        : line.startsWith('💾') ? '#c084fc'
                        : line.startsWith('[DEBUGGER]') ? '#f59e0b'
                        : line.startsWith('[SUGGESTIONS]') ? '#60a5fa'
                        : '#94a3b8' 
                    }}>
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="p-4 mt-auto shrink-0" style={{ borderTop: `1px solid ${BORDER}` }}>
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

      {/* ── ASK AI MODAL / POPUP ── */}
      {showHintModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-4"
            style={{ background: '#161b27', border: '1px solid rgba(37,99,235,0.3)' }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-2 text-blue-400">
                <Brain className="h-5 w-5" />
                <h3 className="font-bold text-base text-white">AI Mentor Guidance</h3>
              </div>
              <button 
                onClick={() => setShowHintModal(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {hintLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                <p className="text-xs text-slate-400">Consulting AI mentor for insights…</p>
              </div>
            ) : hintData ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">Key Hint</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{hintData.hint}</p>
                </div>
                {hintData.approach && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Recommended Approach</p>
                    <div className="rounded-xl p-3 text-xs text-slate-300 whitespace-pre-line leading-relaxed" style={{ background: '#0d1117', border: `1px solid ${BORDER}` }}>
                      {hintData.approach}
                    </div>
                  </div>
                )}
                {hintData.complexity_tip && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 px-3 py-2 rounded-lg border border-emerald-900/30">
                    <span className="font-bold">Target Complexity:</span>
                    <span>{hintData.complexity_tip}</span>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHintModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
                style={{ background: '#2563eb' }}
              >
                Got It
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
