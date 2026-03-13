import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { OptimizationResponse } from '@repo/types';

type TabKey = 'overview' | 'keywords' | 'rewrites';

type AccordionState = {
  summary: boolean;
  experience: boolean;
  actionVerbs: boolean;
  impact: boolean;
  tools: boolean;
  adjectives: boolean;
};

type ToastState = {
  type: 'success' | 'error';
  message: string;
};

const defaultAccordion: AccordionState = {
  summary: true,
  experience: true,
  actionVerbs: false,
  impact: false,
  tools: false,
  adjectives: false,
};

function ScoreRing({ label, value }: { label: string; value?: number }) {
  const safeValue = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(#2563eb ${safeValue * 3.6}deg, #e5e7eb 0deg)`,
          }}
        />
        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center text-sm font-semibold">
          {safeValue}%
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-lg font-semibold">{safeValue}%</p>
      </div>
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition ${active ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
    >
      {children}
    </button>
  );
}

function AccordionSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-semibold">{title}</span>
        <span className="text-slate-400">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">{children}</div>}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/3" />
      <div className="h-24 bg-slate-200 rounded" />
      <div className="h-6 bg-slate-200 rounded w-1/4" />
      <div className="h-32 bg-slate-200 rounded" />
      <div className="h-6 bg-slate-200 rounded w-1/4" />
      <div className="h-32 bg-slate-200 rounded" />
    </div>
  );
}

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div className={`fixed right-6 top-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg transition ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}> 
      {toast.message}
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'optimizing' | 'done'>('idle');
  const [result, setResult] = useState<OptimizationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [accordion, setAccordion] = useState<AccordionState>(defaultAccordion);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const keywordData = result?.keywordAnalysis || result?.gapAnalysis?.keywordAnalysis;

  const showToast = (nextToast: ToastState) => {
    setToast(nextToast);
    setTimeout(() => setToast(null), 2000);
  };

  const handleFileSelect = (file?: File | null) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast({ type: 'error', message: 'Please upload a PDF file.' });
      return;
    }
    setFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    handleFileSelect(droppedFile);
  };

  const handleUploadAndAnalyze = async () => {
    if (!file || !jobTitle || !jobDescription) {
      showToast({ type: 'error', message: 'Please complete all fields.' });
      return;
    }
    setStatus('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data: uploadRes } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus('optimizing');

      const { data: analysisRes } = await api.post('/analysis/run', {
        resumeId: uploadRes.resumeId,
        jobTitle,
        jobDescription,
      });

      setResult(analysisRes);
      setStatus('done');
      setActiveTab('overview');
      showToast({ type: 'success', message: 'Analysis completed successfully.' });
    } catch (e) {
      console.error(e);
      showToast({ type: 'error', message: 'Optimization failed. Check logs.' });
      setStatus('idle');
    }
  };

  const handleExportReport = () => {
    if (!result) return;
    const report = [
      `Match Score: ${result.matchScore}%`,
      `ATS Score: ${result.atsScore}%`,
      `\nMatched Keywords:\n${keywordData?.matched?.join(', ') || ''}`,
      `\nMissing Keywords:\n${keywordData?.missing?.join(', ') || ''}`,
      `\nSuggested Additions:\n${keywordData?.suggestedAdditions?.join(', ') || ''}`,
      `\nSummary Rewrite:\n${result.rewrites?.summary || ''}`,
      `\nExperience Enhancements:\n${result.rewrites?.experienceText || ''}`,
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ats_report.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast({ type: 'success', message: 'Report exported.' });
  };

  useEffect(() => {
    if (status === 'done' && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status]);

  const topGaps = useMemo(() => result?.gapAnalysis?.missingSkills?.slice(0, 3) || [], [result]);

  const handleCopy = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast({ type: 'success', message: 'Copied to clipboard.' });
    } catch (e) {
      console.error(e);
      showToast({ type: 'error', message: 'Copy failed.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {toast && <Toast toast={toast} />}
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Optimizer Workspace</h1>
            <p className="text-sm text-slate-500">ATS-ready resume optimization dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">Welcome, {user?.fullName || user?.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <Card className="shadow-md bg-white">
            <CardHeader>
              <CardTitle>Resume & Job Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-slate-500">1. Upload PDF Resume</label>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer border-2 border-dashed rounded-lg p-4 transition ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400'}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Drag & drop PDF here</p>
                      <p className="text-xs text-slate-500">{file ? file.name : 'or click to browse'}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm">Browse</Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block text-slate-500">2. Target Job Title</label>
                <Input placeholder="e.g. Senior Frontend Engineer" value={jobTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobTitle(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block text-slate-500">3. Job Description</label>
                <Textarea
                  placeholder="Paste the job description here..."
                  className="min-h-[220px]"
                  value={jobDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)}
                />
              </div>

              <Button
                className="w-full h-12 text-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleUploadAndAnalyze}
                disabled={status === 'uploading' || status === 'optimizing'}
              >
                {status === 'idle' && 'Analyze & Optimize Resume'}
                {status === 'uploading' && 'Uploading PDF...'}
                {status === 'optimizing' && 'AI Engines Running...'}
                {status === 'done' && 'Re-run Analysis'}
              </Button>

              {(status === 'uploading' || status === 'optimizing') && (
                <Progress value={status === 'uploading' ? 30 : 80} className="w-full" />
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="shadow-md bg-white" ref={resultsRef}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>AI Optimization Results</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleExportReport} disabled={!result}>
                Export Report
              </Button>
            </CardHeader>
            <CardContent className="max-h-[72vh] overflow-y-auto pr-1">
              {status === 'uploading' || status === 'optimizing' ? (
                <ResultsSkeleton />
              ) : !result && status !== 'done' ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                  <p>Upload a resume and job description to see the AI magic.</p>
                </div>
              ) : (
                <div className="space-y-6 transition-all duration-300">
                  <div className="sticky top-0 bg-white pt-2 pb-4 z-10">
                    <div className="flex gap-2">
                      <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                      <TabButton active={activeTab === 'keywords'} onClick={() => setActiveTab('keywords')}>Keywords</TabButton>
                      <TabButton active={activeTab === 'rewrites'} onClick={() => setActiveTab('rewrites')}>Rewrites</TabButton>
                    </div>
                  </div>

                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <ScoreRing label="Match Score" value={result?.matchScore} />
                        <ScoreRing label="ATS Score" value={result?.atsScore} />
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Top Gaps</h3>
                        <div className="flex flex-wrap gap-2">
                          {topGaps.map((gap: string, i: number) => (
                            <Badge key={i} className="bg-orange-100 text-orange-800 hover:bg-orange-200">{gap}</Badge>
                          ))}
                        </div>
                      </div>

                      <AccordionSection
                        title="Suggested Summary Rewrite"
                        isOpen={accordion.summary}
                        onToggle={() => setAccordion({ ...accordion, summary: !accordion.summary })}
                      >
                        <div className="flex justify-end mb-2">
                          <button className="text-xs text-blue-600 hover:underline" onClick={() => handleCopy(result?.rewrites?.summary)}>⧉ Copy</button>
                        </div>
                        {result?.rewrites?.summary}
                      </AccordionSection>
                    </div>
                  )}

                  {activeTab === 'keywords' && (
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Matched Keywords</p>
                          <div className="flex flex-wrap gap-2">
                            {keywordData?.matched?.map((kw: string, i: number) => (
                              <Badge key={i} className="bg-green-100 text-green-800 hover:bg-green-200">{kw}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500 mb-1">Missing Keywords</p>
                          <div className="flex flex-wrap gap-2">
                            {keywordData?.missing?.map((kw: string, i: number) => (
                              <Badge key={i} className="bg-red-100 text-red-800 hover:bg-red-200">{kw}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 mb-1">Suggested Additions</p>
                        <ul className="list-disc ml-6 text-sm text-slate-700">
                          {keywordData?.suggestedAdditions?.map((kw: string, i: number) => (
                            <li key={i}>{kw}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'rewrites' && (
                    <div className="space-y-4">
                      <AccordionSection
                        title="Experience Bullet Enhancements"
                        isOpen={accordion.experience}
                        onToggle={() => setAccordion({ ...accordion, experience: !accordion.experience })}
                      >
                        <div className="flex justify-end mb-2">
                          <button className="text-xs text-blue-600 hover:underline" onClick={() => handleCopy(result?.rewrites?.experienceText)}>⧉ Copy</button>
                        </div>
                        <div className="whitespace-pre-wrap">{result?.rewrites?.experienceText}</div>
                      </AccordionSection>

                      <AccordionSection
                        title="Action Verb Upgrades"
                        isOpen={accordion.actionVerbs}
                        onToggle={() => setAccordion({ ...accordion, actionVerbs: !accordion.actionVerbs })}
                      >
                        <ul className="list-disc ml-6">
                          {result?.rewrites?.actionVerbUpgrades?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </AccordionSection>

                      <AccordionSection
                        title="Measurable Impact Suggestions"
                        isOpen={accordion.impact}
                        onToggle={() => setAccordion({ ...accordion, impact: !accordion.impact })}
                      >
                        <ul className="list-disc ml-6">
                          {result?.rewrites?.measurableImpactSuggestions?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </AccordionSection>

                      <AccordionSection
                        title="Tool/Tech Additions"
                        isOpen={accordion.tools}
                        onToggle={() => setAccordion({ ...accordion, tools: !accordion.tools })}
                      >
                        <ul className="list-disc ml-6">
                          {result?.rewrites?.toolTechAdditions?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </AccordionSection>

                      <AccordionSection
                        title="Weak Adjectives to Remove"
                        isOpen={accordion.adjectives}
                        onToggle={() => setAccordion({ ...accordion, adjectives: !accordion.adjectives })}
                      >
                        <ul className="list-disc ml-6">
                          {result?.rewrites?.weakAdjectivesToRemove?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </AccordionSection>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}