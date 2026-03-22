import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, LogOut, Sparkles, Target, UploadCloud, WandSparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type {
  GithubAnalyzerResult,
  InterviewQuestionSet,
  OptimizationResponse,
  RecruiterView,
  ResumeRegenerationResponse,
  ResumeTemplate,
  SkillGapRoadmap,
  TeamAnalytics,
} from '@repo/types';

type TabKey = 'overview' | 'keywords' | 'rewrites' | 'roadmap' | 'interview' | 'recruiter' | 'portfolio' | 'business';

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
  const ringColor = safeValue >= 75 ? '#0ea5e9' : safeValue >= 50 ? '#22c55e' : '#f97316';
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = (safeValue / 100) * circumference;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-800 shadow-inner">
          {safeValue}%
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-xl font-semibold text-slate-900">{safeValue}%</p>
      </div>
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-sky-600 text-white shadow-md shadow-sky-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
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
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-semibold text-slate-800">{title}</span>
        <span className="text-slate-400">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">{children}</div>}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-1/3 rounded bg-slate-200" />
      <div className="h-24 rounded bg-slate-200" />
      <div className="h-6 w-1/4 rounded bg-slate-200" />
      <div className="h-32 rounded bg-slate-200" />
      <div className="h-6 w-1/4 rounded bg-slate-200" />
      <div className="h-32 rounded bg-slate-200" />
    </div>
  );
}

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
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
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratedResume, setRegeneratedResume] = useState<ResumeRegenerationResponse | null>(null);
  const [skillGapRoadmap, setSkillGapRoadmap] = useState<SkillGapRoadmap | null>(null);
  const [interviewQuestionSet, setInterviewQuestionSet] = useState<InterviewQuestionSet | null>(null);
  const [recruiterView, setRecruiterView] = useState<RecruiterView | null>(null);
  const [githubAnalyzer, setGithubAnalyzer] = useState<GithubAnalyzerResult | null>(null);
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [teamAnalytics, setTeamAnalytics] = useState<TeamAnalytics | null>(null);
  const [githubProfileUrl, setGithubProfileUrl] = useState('');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
  const [isGeneratingRecruiterView, setIsGeneratingRecruiterView] = useState(false);
  const [isAnalyzingGithub, setIsAnalyzingGithub] = useState(false);
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

      setResumeId(uploadRes.resumeId);
      setRegeneratedResume(null);

      setStatus('optimizing');

      const { data: analysisRes } = await api.post('/analysis/run', {
        resumeId: uploadRes.resumeId,
        jobTitle,
        jobDescription,
      });

      setResult(analysisRes);
      setSkillGapRoadmap(analysisRes.skillGapRoadmap || null);
      setInterviewQuestionSet(analysisRes.interviewQuestionSet || null);
      setRecruiterView(analysisRes.recruiterView || null);
      setGithubAnalyzer(null);
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

  const handleRegenerateResume = async () => {
    if (!resumeId || !jobTitle || !jobDescription) {
      showToast({ type: 'error', message: 'Upload resume, add job title, and paste JD first.' });
      return;
    }

    setIsRegenerating(true);
    try {
      const { data } = await api.post<ResumeRegenerationResponse>('/analysis/regenerate', {
        resumeId,
        jobTitle,
        jobDescription,
      });

      setRegeneratedResume(data);
      setActiveTab('rewrites');
      showToast({ type: 'success', message: 'Regenerated resume draft is ready.' });
    } catch (e) {
      console.error(e);
      showToast({ type: 'error', message: 'Resume regeneration failed.' });
    } finally {
      setIsRegenerating(false);
    }
  };

  const ensureCoreInputs = () => {
    if (!resumeId || !jobTitle || !jobDescription) {
      showToast({ type: 'error', message: 'Upload resume, add job title, and paste JD first.' });
      return false;
    }
    return true;
  };

  const handleGenerateRoadmap = async () => {
    if (!ensureCoreInputs()) return;
    setIsGeneratingRoadmap(true);
    try {
      const { data } = await api.post<SkillGapRoadmap>('/analysis/roadmap', {
        resumeId,
        jobTitle,
        jobDescription,
      });
      setSkillGapRoadmap(data);
      setActiveTab('roadmap');
      showToast({ type: 'success', message: 'Skill roadmap generated.' });
    } catch (e) {
      console.error(e);
      showToast({ type: 'error', message: 'Roadmap generation failed.' });
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleGenerateInterviewQuestions = async () => {
    if (!ensureCoreInputs()) return;
    setIsGeneratingInterview(true);
    try {
      const { data } = await api.post<InterviewQuestionSet>('/analysis/interview-questions', {
        resumeId,
        jobTitle,
        jobDescription,
      });
      setInterviewQuestionSet(data);
      setActiveTab('interview');
      showToast({ type: 'success', message: 'Interview question set generated.' });
    } catch (e) {
      console.error(e);
      showToast({ type: 'error', message: 'Interview generation failed.' });
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  const handleGenerateRecruiterView = async () => {
    if (!ensureCoreInputs()) return;
    setIsGeneratingRecruiterView(true);
    try {
      const { data } = await api.post<RecruiterView>('/analysis/recruiter-view', {
        resumeId,
        jobTitle,
        jobDescription,
      });
      setRecruiterView(data);
      setActiveTab('recruiter');
      showToast({ type: 'success', message: 'Recruiter scan preview generated.' });
    } catch (e) {
      console.error(e);
      showToast({ type: 'error', message: 'Recruiter preview generation failed.' });
    } finally {
      setIsGeneratingRecruiterView(false);
    }
  };

  const handleAnalyzeGithubPortfolio = async () => {
    if (!ensureCoreInputs()) return;
    if (!githubProfileUrl.trim()) {
      showToast({ type: 'error', message: 'Enter your GitHub profile URL.' });
      return;
    }

    setIsAnalyzingGithub(true);
    try {
      const { data } = await api.post<GithubAnalyzerResult>('/analysis/github-analyzer', {
        resumeId,
        jobTitle,
        jobDescription,
        githubProfileUrl,
      });
      setGithubAnalyzer(data);
      setActiveTab('portfolio');
      showToast({ type: 'success', message: 'GitHub account analysis complete.' });
    } catch (e) {
      console.error(e);
      showToast({ type: 'error', message: 'GitHub analyzer failed.' });
    } finally {
      setIsAnalyzingGithub(false);
    }
  };

  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        const [templatesRes, teamRes] = await Promise.all([
          api.get<ResumeTemplate[]>('/analysis/templates/list'),
          api.get<TeamAnalytics>('/analysis/team/overview'),
        ]);

        setTemplates(templatesRes.data);
        setTeamAnalytics(teamRes.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadBusinessData();
  }, []);

  const handleExportRegeneratedPdf = () => {
    const draft = regeneratedResume?.regeneratedResume?.trim();
    if (!draft) {
      showToast({ type: 'error', message: 'No regenerated draft to export.' });
      return;
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 48;
    const marginY = 56;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - marginX * 2;
    const fileSafeTitle = (jobTitle || 'resume').replace(/[^a-z0-9]/gi, '_').toLowerCase();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Regenerated Resume Draft', marginX, marginY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Target Role: ${jobTitle || 'N/A'}`, marginX, marginY + 18);

    doc.setFontSize(11);
    const lines = doc.splitTextToSize(draft, maxLineWidth) as string[];
    let y = marginY + 42;

    for (const line of lines) {
      if (y > pageHeight - marginY) {
        doc.addPage();
        y = marginY;
      }
      doc.text(line, marginX, y);
      y += 16;
    }

    doc.save(`regenerated_resume_${fileSafeTitle}.pdf`);
    showToast({ type: 'success', message: 'Regenerated resume exported as PDF.' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-sky-300/25 blur-3xl" />

      {toast && <Toast toast={toast} />}
      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/50 backdrop-blur-md sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="block h-14 w-52 sm:h-20 sm:w-72">
                <img src="/logo.png" alt="HiredLens" className="h-full w-full object-contain drop-shadow-sm" />
              </Link>
              <div className="hidden border-l border-slate-300 pl-4 sm:block">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Optimization Workspace</h1>
                <p className="text-sm text-slate-500">Upload, analyze, and tailor your resume for every role</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
                {user?.fullName || user?.email}
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="rounded-full border-slate-300 bg-white/90">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-white/70 bg-white/85 shadow-xl shadow-slate-200/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-5 w-5 text-sky-600" />
                Resume and Job Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-500">1. Upload PDF Resume</label>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-xl border-2 border-dashed p-4 transition ${isDragging ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-slate-50 hover:border-sky-400'}`}
                >
                  <input
                    id="resume-upload"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    aria-label="Upload resume PDF"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Drag and drop PDF here</p>
                      <p className="text-xs text-slate-500">{file ? file.name : 'or click to browse'}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="rounded-full">
                      <UploadCloud className="h-4 w-4" />
                      Browse
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-500">2. Target Job Title</label>
                <Input
                  placeholder="e.g. Senior Frontend Engineer"
                  className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-sky-500"
                  value={jobTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-500">3. Job Description</label>
                <Textarea
                  placeholder="Paste the job description here..."
                  className="min-h-[220px] rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-sky-500"
                  value={jobDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)}
                />
              </div>

              <Button
                className="h-12 w-full rounded-xl bg-sky-600 text-md text-white shadow-lg shadow-sky-200 hover:bg-sky-700"
                onClick={handleUploadAndAnalyze}
                disabled={status === 'uploading' || status === 'optimizing'}
              >
                <Sparkles className="h-4 w-4" />
                {status === 'idle' && 'Analyze & Optimize Resume'}
                {status === 'uploading' && 'Uploading PDF...'}
                {status === 'optimizing' && 'AI Engines Running...'}
                {status === 'done' && 'Re-run Analysis'}
              </Button>

              {(status === 'uploading' || status === 'optimizing') && (
                <Progress value={status === 'uploading' ? 30 : 80} className="h-2 w-full rounded-full bg-slate-100" />
              )}

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl border-sky-200 bg-white text-sky-700 hover:bg-sky-50"
                onClick={handleRegenerateResume}
                disabled={isRegenerating || !resumeId || !jobTitle || !jobDescription}
              >
                <WandSparkles className="h-4 w-4" />
                {isRegenerating ? 'Regenerating Resume...' : 'Regenerate Resume For This Role'}
              </Button>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  onClick={handleGenerateRoadmap}
                  disabled={isGeneratingRoadmap}
                >
                  {isGeneratingRoadmap ? 'Generating...' : 'Build 30/60/90 Roadmap'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  onClick={handleGenerateInterviewQuestions}
                  disabled={isGeneratingInterview}
                >
                  {isGeneratingInterview ? 'Generating...' : 'Generate Interview Qs'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 sm:col-span-2"
                  onClick={handleGenerateRecruiterView}
                  disabled={isGeneratingRecruiterView}
                >
                  {isGeneratingRecruiterView ? 'Generating...' : 'Generate Recruiter 6-Second View'}
                </Button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Portfolio/GitHub Analyzer</p>
                <div className="grid gap-2">
                  <Input
                    placeholder="GitHub profile URL (e.g. https://github.com/username)"
                    className="h-10 rounded-lg border-slate-200 bg-white"
                    value={githubProfileUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGithubProfileUrl(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 h-10 w-full rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  onClick={handleAnalyzeGithubPortfolio}
                  disabled={isAnalyzingGithub}
                >
                  {isAnalyzingGithub ? 'Analyzing GitHub...' : 'Analyze GitHub Portfolio'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur-md" ref={resultsRef}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-cyan-600" />
                AI Optimization Results
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleExportReport} disabled={!result} className="rounded-full">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </CardHeader>
            <CardContent className="max-h-[72vh] overflow-y-auto pr-1">
              {status === 'uploading' || status === 'optimizing' ? (
                <ResultsSkeleton />
              ) : !result && status !== 'done' ? (
                <div className="flex min-h-[400px] h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                  <Sparkles className="mb-2 h-6 w-6" />
                  <p>Upload a resume and job description to see your analysis.</p>
                </div>
              ) : (
                <div className="space-y-6 transition-all duration-300">
                  <div className="sticky top-0 z-10 bg-white/95 pb-4 pt-2 backdrop-blur-sm">
                    <div className="flex gap-2">
                      <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                      <TabButton active={activeTab === 'keywords'} onClick={() => setActiveTab('keywords')}>Keywords</TabButton>
                      <TabButton active={activeTab === 'rewrites'} onClick={() => setActiveTab('rewrites')}>Rewrites</TabButton>
                      <TabButton active={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')}>Roadmap</TabButton>
                      <TabButton active={activeTab === 'interview'} onClick={() => setActiveTab('interview')}>Interview</TabButton>
                      <TabButton active={activeTab === 'recruiter'} onClick={() => setActiveTab('recruiter')}>Recruiter View</TabButton>
                      <TabButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')}>Portfolio</TabButton>
                      <TabButton active={activeTab === 'business'} onClick={() => setActiveTab('business')}>Business</TabButton>
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
                            <Badge key={i} className="border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100">{gap}</Badge>
                          ))}
                        </div>
                      </div>

                      <AccordionSection
                        title="Suggested Summary Rewrite"
                        isOpen={accordion.summary}
                        onToggle={() => setAccordion({ ...accordion, summary: !accordion.summary })}
                      >
                        <div className="flex justify-end mb-2">
                          <button className="text-xs font-semibold text-sky-600 hover:underline" onClick={() => handleCopy(result?.rewrites?.summary)}>Copy</button>
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
                              <Badge key={i} className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100">{kw}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500 mb-1">Missing Keywords</p>
                          <div className="flex flex-wrap gap-2">
                            {keywordData?.missing?.map((kw: string, i: number) => (
                              <Badge key={i} className="border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100">{kw}</Badge>
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
                        title="Regenerated Resume Draft"
                        isOpen={true}
                        onToggle={() => undefined}
                      >
                        {regeneratedResume ? (
                          <div>
                            <div className="mb-2 flex justify-end gap-3">
                              <button
                                className="text-xs font-semibold text-sky-600 hover:underline"
                                onClick={() => handleCopy(regeneratedResume.regeneratedResume)}
                              >
                                Copy Draft
                              </button>
                              <button
                                className="text-xs font-semibold text-sky-600 hover:underline"
                                onClick={handleExportRegeneratedPdf}
                              >
                                Export PDF
                              </button>
                            </div>
                            <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                              {regeneratedResume.regeneratedResume}
                            </div>
                            {regeneratedResume.highlights && regeneratedResume.highlights.length > 0 && (
                              <div className="mt-3">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Highlights</p>
                                <ul className="list-disc ml-6 text-sm text-slate-700">
                                  {regeneratedResume.highlights.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">Click "Regenerate Resume For This Role" to generate a full tailored draft.</p>
                        )}
                      </AccordionSection>

                      <AccordionSection
                        title="Experience Bullet Enhancements"
                        isOpen={accordion.experience}
                        onToggle={() => setAccordion({ ...accordion, experience: !accordion.experience })}
                      >
                        <div className="flex justify-end mb-2">
                          <button className="text-xs font-semibold text-sky-600 hover:underline" onClick={() => handleCopy(result?.rewrites?.experienceText)}>Copy</button>
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

                  {activeTab === 'roadmap' && (
                    <div className="space-y-4">
                      {!skillGapRoadmap ? (
                        <p className="text-sm text-slate-500">Generate roadmap to view a 30/60/90-day upskilling plan.</p>
                      ) : (
                        <>
                          <div>
                            <p className="mb-2 text-sm font-semibold text-slate-700">Missing Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {skillGapRoadmap.missingSkills.map((skill, idx) => (
                                <Badge key={idx} className="border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                          {skillGapRoadmap.phases.map((phase, idx) => (
                            <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{phase.timeframe.replace('_', '/')}</p>
                              <div className="mt-2 grid gap-4 md:grid-cols-3">
                                <div>
                                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Goals</p>
                                  <ul className="list-disc ml-5 text-sm text-slate-700">
                                    {phase.goals.map((item, i) => <li key={i}>{item}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Learning Resources</p>
                                  <ul className="list-disc ml-5 text-sm text-slate-700">
                                    {phase.learningResources.map((item, i) => <li key={i}>{item}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Mini Projects</p>
                                  <ul className="list-disc ml-5 text-sm text-slate-700">
                                    {phase.miniProjects.map((item, i) => <li key={i}>{item}</li>)}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'interview' && (
                    <div className="space-y-4">
                      {!interviewQuestionSet ? (
                        <p className="text-sm text-slate-500">Generate interview questions to view likely technical and behavioral rounds.</p>
                      ) : (
                        <>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-2 text-sm font-semibold text-slate-700">Technical Questions</p>
                            <div className="space-y-3">
                              {interviewQuestionSet.technical.map((item, idx) => (
                                <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                                  <p className="font-semibold text-slate-900">{item.question}</p>
                                  <p className="mt-1 text-slate-600"><span className="font-medium">Why asked:</span> {item.whyAsked}</p>
                                  <p className="mt-1 text-slate-600"><span className="font-medium">Sample answer:</span> {item.sampleAnswer}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-2 text-sm font-semibold text-slate-700">Behavioral Questions</p>
                            <div className="space-y-3">
                              {interviewQuestionSet.behavioral.map((item, idx) => (
                                <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                                  <p className="font-semibold text-slate-900">{item.question}</p>
                                  <p className="mt-1 text-slate-600"><span className="font-medium">Why asked:</span> {item.whyAsked}</p>
                                  <p className="mt-1 text-slate-600"><span className="font-medium">Sample answer:</span> {item.sampleAnswer}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-2 text-sm font-semibold text-slate-700">STAR Answer Drafts</p>
                            <div className="space-y-3">
                              {interviewQuestionSet.starAnswers.map((item, idx) => (
                                <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                                  <p><span className="font-semibold text-slate-900">Situation:</span> {item.situation}</p>
                                  <p><span className="font-semibold text-slate-900">Task:</span> {item.task}</p>
                                  <p><span className="font-semibold text-slate-900">Action:</span> {item.action}</p>
                                  <p><span className="font-semibold text-slate-900">Result:</span> {item.result}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'recruiter' && (
                    <div className="space-y-4">
                      {!recruiterView ? (
                        <p className="text-sm text-slate-500">Generate recruiter preview to see six-second scan highlights.</p>
                      ) : (
                        <>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">First Impression Score</p>
                            <p className="text-3xl font-bold text-slate-900">{Math.max(0, Math.min(100, recruiterView.firstImpressionScore))}%</p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-2 text-sm font-semibold text-slate-700">6-Second Highlights</p>
                            <ul className="list-disc ml-5 text-sm text-slate-700">
                              {recruiterView.sixSecondHighlights.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-2 text-sm font-semibold text-slate-700">Attention Heatmap by Section</p>
                            <div className="space-y-2">
                              {recruiterView.attentionHeatmap.map((section, idx) => (
                                <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3">
                                  <div className="mb-1 flex items-center justify-between text-sm font-medium text-slate-800">
                                    <span>{section.section}</span>
                                    <span>{Math.max(0, Math.min(100, section.attentionScore))}%</span>
                                  </div>
                                  <Progress value={Math.max(0, Math.min(100, section.attentionScore))} className="h-2" />
                                  <p className="mt-2 text-xs text-slate-500">{section.rationale}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'portfolio' && (
                    <div className="space-y-4">
                      {!githubAnalyzer ? (
                        <p className="text-sm text-slate-500">Provide your GitHub profile URL and run analyzer to get stronger project bullets.</p>
                      ) : (
                        <>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">GitHub Account</p>
                            <p className="text-lg font-semibold text-slate-900">{githubAnalyzer.profile}</p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-2 text-sm font-semibold text-slate-700">Detected Achievements</p>
                            <ul className="list-disc ml-5 text-sm text-slate-700">
                              {githubAnalyzer.achievements.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                          </div>
                          <div className="space-y-3">
                            {githubAnalyzer.bulletSuggestions.map((suggestion, idx) => (
                              <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bullet #{idx + 1}</p>
                                <p className="mt-2 text-slate-600"><span className="font-medium">Original:</span> {suggestion.original}</p>
                                <p className="mt-1 text-slate-800"><span className="font-medium">Improved:</span> {suggestion.improved}</p>
                                <p className="mt-1 text-slate-600"><span className="font-medium">Quantified:</span> {suggestion.quantifiedContribution}</p>
                                <p className="mt-1 text-slate-600"><span className="font-medium">Tech framing:</span> {suggestion.techStackFraming}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'business' && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-slate-700">Premium Templates + Formatting Engine</p>
                        {templates.length === 0 ? (
                          <p className="text-sm text-slate-500">No templates loaded.</p>
                        ) : (
                          <div className="grid gap-2">
                            {templates.map((template) => (
                              <div key={template.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-slate-900">{template.name}</p>
                                  <Badge className="border-sky-200 bg-sky-50 text-sky-700">{template.tone}</Badge>
                                </div>
                                <p className="mt-1 text-slate-600">{template.description}</p>
                                <p className="mt-1 text-xs text-slate-500">ATS-safe: {template.atsSafe ? 'Yes' : 'No'}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-slate-700">Team/University Mode</p>
                        {teamAnalytics ? (
                          <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Team</p>
                              <p className="font-semibold text-slate-900">{teamAnalytics.teamName}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Members</p>
                              <p className="font-semibold text-slate-900">{teamAnalytics.members}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Avg Match Score</p>
                              <p className="font-semibold text-slate-900">{teamAnalytics.avgMatchScore}%</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                              <p className="text-xs uppercase tracking-wide text-slate-500">Avg ATS Score</p>
                              <p className="font-semibold text-slate-900">{teamAnalytics.avgAtsScore}%</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No team metrics yet.</p>
                        )}
                      </div>
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