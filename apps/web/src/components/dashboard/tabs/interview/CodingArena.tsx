import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CodingPracticeQuestion, CodingPracticeSet, CodingEvaluation } from '@repo/types';
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  FlaskConical,
  Loader2,
  RefreshCw,
  Sparkles,
  Timer,
  Zap,
  AlertTriangle,
  BookOpen,
  Trophy,
  Tag,
} from 'lucide-react';

interface Props {
  onBackToInterview: () => void;
  onGenerateCodingQuestions: () => Promise<CodingPracticeSet>;
  onEvaluateCode: (question: string, code: string) => Promise<CodingEvaluation>;
  language: string;
  remainingSeconds: number;
  jobTitle: string;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

export function CodingArena({
  onBackToInterview,
  onGenerateCodingQuestions,
  onEvaluateCode,
  language,
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

  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const seconds = String(remainingSeconds % 60).padStart(2, '0');
  const timerColor = remainingSeconds < 300 ? 'text-rose-400' : 'text-cyan-400';

  const activeQuestion = questions[selectedIdx];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setEvaluation(null);
    setCode('');
    try {
      const result = await onGenerateCodingQuestions();
      setQuestions(result.questions || []);
      setSelectedIdx(0);
      setSolvedSet(new Set());
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
    try {
      const result = await onEvaluateCode(activeQuestion.prompt, code);
      setEvaluation(result);
      if (result.score >= 60) {
        setSolvedSet(prev => new Set(prev).add(selectedIdx));
      }
    } catch {
      setError('Could not evaluate your code. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSelectQuestion = (idx: number) => {
    setSelectedIdx(idx);
    setEvaluation(null);
    setCode('');
    setError(null);
  };

  // Auto-generate on first mount
  useEffect(() => {
    if (questions.length === 0) {
      handleGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-950 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToInterview}
            className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Interview
          </Button>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-cyan-500" />
            <span className="font-semibold text-slate-200 text-sm">Coding Arena</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded border border-slate-700 bg-slate-800/50 text-xs font-mono text-cyan-300">
            {language}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {questions.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              {solvedSet.size}/{questions.length} solved
            </div>
          )}
          <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${timerColor}`}>
            <Timer className="h-4 w-4" />
            {minutes}:{seconds}
          </div>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {isGenerating ? 'Generating...' : 'New Questions'}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && questions.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-10 w-10 text-cyan-500/60 animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">Generating Questions</p>
            <p className="text-sm text-slate-400 mt-1">
              AI is crafting challenges tailored for <span className="text-cyan-400">{jobTitle}</span>
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isGenerating && questions.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="p-6 rounded-2xl border border-dashed border-slate-700 text-center max-w-sm">
            <Sparkles className="h-10 w-10 text-cyan-500 mx-auto mb-4 opacity-60" />
            <p className="text-slate-300 font-medium">No questions yet</p>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Hit the button to generate JD-tailored coding challenges
            </p>
            <Button onClick={handleGenerate} className="bg-cyan-600 hover:bg-cyan-500 text-white">
              Generate Questions
            </Button>
          </div>
        </div>
      )}

      {/* Main 3-Column Layout */}
      {questions.length > 0 && !isGenerating && (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Question List */}
          <div className="w-64 border-r border-slate-800 flex flex-col bg-slate-900/30 shrink-0">
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                {questions.length} Challenge{questions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuestion(idx)}
                    className={`w-full text-left rounded-xl border px-3 py-3 transition-all group ${
                      selectedIdx === idx
                        ? 'border-cyan-500/50 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                        : 'border-slate-800 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${selectedIdx === idx ? 'text-cyan-200' : 'text-slate-300 group-hover:text-slate-100'}`}>
                          {q.title}
                        </p>
                        <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase rounded border ${
                          DIFFICULTY_STYLES[q.difficulty?.toLowerCase() || 'medium']
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="shrink-0 mt-0.5">
                        {solvedSet.has(idx) ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : selectedIdx === idx ? (
                          <ChevronRight className="h-4 w-4 text-cyan-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-600" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Center: Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/40 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/60" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                </div>
                <span className="ml-1 font-mono">solution.{language.toLowerCase() === 'javascript' ? 'js' : language.toLowerCase() === 'python' ? 'py' : language.toLowerCase() === 'java' ? 'java' : language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase()}</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/50">
                {language}
              </span>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={language.toLowerCase().replace('c++', 'cpp').replace('c#', 'csharp')}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineHeight: 22,
                  padding: { top: 16, bottom: 16 },
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                  fontLigatures: true,
                  cursorBlinking: 'smooth',
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'gutter',
                  bracketPairColorization: { enabled: true },
                  smoothScrolling: true,
                  wordWrap: 'on',
                }}
              />
            </div>

            {/* Editor Bottom Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/60 shrink-0">
              <div className="text-xs text-slate-500 font-mono">
                {code.split('\n').length} lines · {code.length} chars
              </div>
              <Button
                onClick={handleEvaluate}
                disabled={isEvaluating || !code.trim() || !activeQuestion}
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <FlaskConical className="h-4 w-4" />
                    Submit for AI Review
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right: Problem Details + Evaluation */}
          <div className="w-96 border-l border-slate-800 flex flex-col bg-slate-900/20 shrink-0">
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-5">
                {/* Problem Header */}
                {activeQuestion && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase rounded border ${
                          DIFFICULTY_STYLES[activeQuestion.difficulty?.toLowerCase() || 'medium']
                        }`}>
                          {activeQuestion.difficulty}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-white leading-tight">
                        {activeQuestion.title}
                      </h2>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                        <BookOpen className="h-3 w-3" />
                        Problem Statement
                      </div>
                      <div className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 whitespace-pre-wrap">
                        {activeQuestion.prompt}
                      </div>
                    </div>

                    {activeQuestion.expected_topics && activeQuestion.expected_topics.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cyan-500 font-semibold">
                          <Tag className="h-3 w-3" />
                          Key Topics to Cover
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {activeQuestion.expected_topics.map((topic, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-full text-xs bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 font-medium">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-rose-700/50 bg-rose-950/20 p-4">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-300">{error}</p>
                  </div>
                )}

                {/* Evaluation Result */}
                {isEvaluating && (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="relative">
                      <div className="h-14 w-14 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-emerald-400 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">AI is reviewing your solution...</p>
                  </div>
                )}

                {evaluation && !isEvaluating && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-500 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      AI Evaluation
                    </div>

                    {/* Score */}
                    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-slate-300">Overall Score</span>
                        <span className={`text-2xl font-black ${
                          evaluation.score >= 80 ? 'text-emerald-400' :
                          evaluation.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {evaluation.score}<span className="text-sm font-normal text-slate-500">/100</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            evaluation.score >= 80 ? 'bg-emerald-500' :
                            evaluation.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${evaluation.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Complexity */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Time</p>
                        <p className="text-sm font-bold font-mono text-cyan-400 mt-1">{evaluation.time_complexity}</p>
                      </div>
                      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Space</p>
                        <p className="text-sm font-bold font-mono text-purple-400 mt-1">{evaluation.space_complexity}</p>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Feedback</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{evaluation.feedback}</p>
                    </div>

                    {/* Solved Badge */}
                    {evaluation.score >= 60 && (
                      <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-700/30 bg-emerald-950/20">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-400">Challenge Solved!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
