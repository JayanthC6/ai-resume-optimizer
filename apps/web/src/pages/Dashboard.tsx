import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { jsPDF } from 'jspdf';
import { Sparkles, AlertCircle } from 'lucide-react';
import type {
  GithubAnalyzerResult,
  InterviewQuestionSet,
  OptimizationResponse,
  ResumeRegenerationResponse,
  SkillGapRoadmap,
} from '@repo/types';

import { DashboardSidebar, type TabKey } from '@/components/dashboard/DashboardSidebar';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { SetupView } from '@/components/dashboard/SetupView';
import { OverviewPanel } from '@/components/dashboard/tabs/OverviewPanel';
import { KeywordsPanel } from '@/components/dashboard/tabs/KeywordsPanel';
import { RewritesPanel } from '@/components/dashboard/tabs/RewritesPanel';
import { RoadmapPanel } from '@/components/dashboard/tabs/RoadmapPanel';
import { InterviewPanel } from '@/components/dashboard/tabs/InterviewPanel';
import { InterviewBotPanel } from '@/components/dashboard/tabs/interview/InterviewBotPanel';
import { PortfolioPanel } from '@/components/dashboard/tabs/PortfolioPanel';
import { HistoryPanel } from '@/components/dashboard/tabs/HistoryPanel';

type ToastState = { type: 'success' | 'error'; message: string };

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div
      className={`fixed right-6 top-6 z-[60] rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition ${
        toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
      }`}
    >
      {toast.message}
    </div>
  );
}

const STORAGE_KEY = 'hiredlens_dashboard_state';

function getSavedState() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const savedState = useRef(getSavedState()).current;

  // Setup state
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>(savedState?.fileName || '');
  const [jobTitle, setJobTitle] = useState(savedState?.jobTitle || '');
  const [jobDescription, setJobDescription] = useState(savedState?.jobDescription || '');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'optimizing' | 'done'>(savedState?.status || 'idle');
  const [resumeId, setResumeId] = useState<string | null>(savedState?.resumeId || null);
  const [originalText, setOriginalText] = useState<string | null>(savedState?.originalText || null);

  // Results state
  const [result, setResult] = useState<OptimizationResponse | null>(savedState?.result || null);
  const [regeneratedResume, setRegeneratedResume] = useState<ResumeRegenerationResponse | null>(savedState?.regeneratedResume || null);
  const [skillGapRoadmap, setSkillGapRoadmap] = useState<SkillGapRoadmap | null>(savedState?.skillGapRoadmap || null);
  const [interviewQuestionSet, setInterviewQuestionSet] = useState<InterviewQuestionSet | null>(savedState?.interviewQuestionSet || null);
  const [githubAnalyzer, setGithubAnalyzer] = useState<GithubAnalyzerResult | null>(savedState?.githubAnalyzer || null);
  const [githubProfileUrl, setGithubProfileUrl] = useState(savedState?.githubProfileUrl || '');

  // UI state
  const [view, setView] = useState<'setup' | 'results'>(savedState?.view || 'setup');
  const [activeTab, setActiveTab] = useState<TabKey>(savedState?.activeTab || 'overview');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
  const [isAnalyzingGithub, setIsAnalyzingGithub] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      fileName,
      jobTitle,
      jobDescription,
      status,
      resumeId,
      result,
      regeneratedResume,
      skillGapRoadmap,
      interviewQuestionSet,
      githubAnalyzer,
      githubProfileUrl,
      view,
      activeTab,
    }));
  }, [
    fileName, jobTitle, jobDescription, status, resumeId, result, regeneratedResume,
    skillGapRoadmap, interviewQuestionSet, githubAnalyzer, githubProfileUrl,
    view, activeTab
  ]);

  const keywordData = result?.keywordAnalysis || result?.gapAnalysis?.keywordAnalysis || null;

  const showToast = (next: ToastState) => {
    setToast(next);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  };

  const handleFileSelect = (file?: File | null) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast({ type: 'error', message: 'Please upload a PDF file.' });
      return;
    }
    setFile(file);
    setFileName(file.name);
  };

  const handleUploadAndAnalyze = async () => {
    if ((!file && !resumeId) || !jobTitle || !jobDescription) {
      showToast({ type: 'error', message: 'Please complete all fields.' });
      return;
    }
    setStatus('uploading');

    try {
      let currentResumeId = resumeId;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const { data: uploadRes } = await api.post('/resume/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        currentResumeId = uploadRes.resumeId;
        setResumeId(currentResumeId);
      }

      setRegeneratedResume(null);
      setStatus('optimizing');

      const { data: analysisRes } = await api.post('/analysis/run', {
        resumeId: currentResumeId,
        jobTitle,
        jobDescription,
      });

      setOriginalText(null); // Because we have the file for the iframe

      setResult(analysisRes);
      setSkillGapRoadmap(analysisRes.skillGapRoadmap || null);
      setInterviewQuestionSet(analysisRes.interviewQuestionSet || null);
      setGithubAnalyzer(null);
      setStatus('done');
      setActiveTab('overview');
      setView('results');
      showToast({ type: 'success', message: 'Analysis completed successfully!' });
    } catch (e) {
      console.error(e);
      showToast({ type: 'error', message: 'Optimization failed. Check logs.' });
      setStatus('idle');
    }
  };

  const handleCopy = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast({ type: 'success', message: 'Copied to clipboard.' });
    } catch {
      showToast({ type: 'error', message: 'Copy failed.' });
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

  const handleExportRegeneratedPdf = () => {
    const draft = regeneratedResume?.updatedResume || regeneratedResume?.regeneratedResume || '';
    if (!draft) {
      showToast({ type: 'error', message: 'No edited draft to export.' });
      return;
    }

    let textToExport = '';
    if (typeof draft === 'object') {
      textToExport = JSON.stringify(draft, null, 2);
    } else {
      textToExport = draft.trim();
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
    doc.text('Edited Resume Draft', marginX, marginY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Target Role: ${jobTitle || 'N/A'}`, marginX, marginY + 18);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(textToExport, maxLineWidth) as string[];
    let y = marginY + 42;
    for (const line of lines) {
      if (y > pageHeight - marginY) {
        doc.addPage();
        y = marginY;
      }
      doc.text(line, marginX, y);
      y += 16;
    }
    doc.save(`edited_resume_${fileSafeTitle}.pdf`);
    showToast({ type: 'success', message: 'Edited resume exported as PDF.' });
  };

  const ensureCoreInputs = () => {
    if (!resumeId || !jobTitle || !jobDescription) {
      showToast({ type: 'error', message: 'Upload resume, add job title, and paste JD first.' });
      return false;
    }
    return true;
  };

  const handleRegenerateResume = async () => {
    if (!ensureCoreInputs()) return;
    setIsRegenerating(true);
    try {
      const { data } = await api.post<ResumeRegenerationResponse>('/analysis/regenerate', { resumeId, jobTitle, jobDescription });
      setRegeneratedResume(data);
      setActiveTab('rewrites');
      showToast({ type: 'success', message: 'Edited resume draft is ready.' });
    } catch {
      showToast({ type: 'error', message: 'Resume editing failed.' });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!ensureCoreInputs()) return;
    setIsGeneratingRoadmap(true);
    try {
      const { data } = await api.post<SkillGapRoadmap>('/analysis/roadmap', { resumeId, jobTitle, jobDescription });
      setSkillGapRoadmap(data);
      setActiveTab('roadmap');
      showToast({ type: 'success', message: 'Skill roadmap generated.' });
    } catch {
      showToast({ type: 'error', message: 'Roadmap generation failed.' });
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleGenerateInterviewQuestions = async () => {
    if (!ensureCoreInputs()) return;
    setIsGeneratingInterview(true);
    try {
      const { data } = await api.post<InterviewQuestionSet>('/analysis/interview-questions', { resumeId, jobTitle, jobDescription });
      setInterviewQuestionSet(data);
      setActiveTab('interview');
      showToast({ type: 'success', message: 'Interview question set generated.' });
    } catch {
      showToast({ type: 'error', message: 'Interview generation failed.' });
    } finally {
      setIsGeneratingInterview(false);
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
      const { data } = await api.post<GithubAnalyzerResult>('/analysis/github-analyzer', { resumeId, jobTitle, jobDescription, githubProfileUrl });
      setGithubAnalyzer(data);
      setActiveTab('portfolio');
      showToast({ type: 'success', message: 'GitHub analysis complete.' });
    } catch {
      showToast({ type: 'error', message: 'GitHub analyzer failed.' });
    } finally {
      setIsAnalyzingGithub(false);
    }
  };

  const handleNewAnalysis = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setFile(null);
    setFileName('');
    setJobTitle('');
    setJobDescription('');
    setResumeId(null);
    setResult(null);
    setRegeneratedResume(null);
    setSkillGapRoadmap(null);
    setInterviewQuestionSet(null);
    setGithubAnalyzer(null);
    setGithubProfileUrl('');
    setOriginalText(null);
    setActiveTab('overview');
    setView('setup');
    setStatus('idle');
  };

  // Auto-navigate to results if result exists on mount
  useEffect(() => {
    if (result && status === 'done') {
      setView('results');
    }
  }, []);

  const handleSelectHistory = async (analysisId: string) => {
    try {
      showToast({ type: 'success', message: 'Loading past application...' });
      const { data } = await api.get(`/analysis/${analysisId}`);
      
      setResumeId(data.resume.id);
      setJobTitle(data.jobTitle);
      setJobDescription(data.jobDescription);
      
      setResult(data);
      setRegeneratedResume({ updatedResume: data.rewrites, regeneratedResume: '' });
      setSkillGapRoadmap(data.skillGapRoadmap || null);
      setInterviewQuestionSet(data.interviewQuestionSet || null);
      setGithubAnalyzer(null);
      
      setFile(null); 
      setOriginalText(data.resume.rawText || null);
      setFileName(data.resume.originalFilename || 'historical_resume.pdf');
      
      setStatus('done');
      setActiveTab('overview');
      setView('results');
    } catch (e) {
      showToast({ type: 'error', message: 'Failed to load past application.' });
    }
  };

  // ─── RENDER ───────────────────────────────────────────────

  // Setup view (clean upload form)
  if (view === 'setup') {
    return (
      <>
        {toast && <Toast toast={toast} />}
        <SetupView
          file={file}
          fileName={fileName}
          jobTitle={jobTitle}
          jobDescription={jobDescription}
          status={status}
          onFileSelect={handleFileSelect}
          onJobTitleChange={setJobTitle}
          onJobDescriptionChange={setJobDescription}
          onSubmit={handleUploadAndAnalyze}
          userName={user?.fullName || user?.email || undefined}
          onLogout={logout}
        />
      </>
    );
  }

  // Results view (sidebar + top bar + content)
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {toast && <Toast toast={toast} />}

      {/* Sidebar */}
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:p-4 lg:pl-0">
        {/* Top bar */}
        <DashboardTopBar
          candidateName={user?.fullName || 'Candidate'}
          roleTitle={jobTitle}
          matchScore={result?.matchScore}
          atsScore={result?.atsScore}
          onExportReport={handleExportReport}
          onNewAnalysis={handleNewAnalysis}
          onLogout={logout}
          hasResults={!!result}
        />

        {/* Content */}
        <main className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-white/70 bg-white/60 p-5 shadow-lg shadow-slate-200/30 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none sm:p-6 lg:p-8">
          {!result && activeTab !== 'history' ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Sparkles className="mb-3 h-8 w-8" />
              <p>No analysis results yet. Run an analysis to get started.</p>
            </div>
          ) : (
            <>
              {activeTab === 'history' && (
                <HistoryPanel onSelectHistory={handleSelectHistory} />
              )}
              
              {activeTab === 'overview' && result && (
                <OverviewPanel
                  result={result}
                  candidateName={user?.fullName || 'Your Resume'}
                  roleTitle={jobTitle}
                  onCopy={handleCopy}
                />
              )}

              {activeTab === 'keywords' && (
                <KeywordsPanel keywordData={keywordData} />
              )}

              {activeTab === 'rewrites' && result && (
                <RewritesPanel
                  result={result}
                  regeneratedResume={regeneratedResume}
                  isRegenerating={isRegenerating}
                  onRegenerate={handleRegenerateResume}
                  onCopy={handleCopy}
                  onExportPdf={handleExportRegeneratedPdf}
                  originalFile={file}
                  originalText={originalText}
                />
              )}

              {activeTab === 'roadmap' && (
                <RoadmapPanel
                  skillGapRoadmap={skillGapRoadmap}
                  isGenerating={isGeneratingRoadmap}
                  onGenerate={handleGenerateRoadmap}
                />
              )}

              {activeTab === 'interview' && (
                <InterviewPanel
                  interviewQuestionSet={interviewQuestionSet}
                  isGenerating={isGeneratingInterview}
                  onGenerate={handleGenerateInterviewQuestions}
                />
              )}

              {activeTab === 'mock-interview' && (
                resumeId ? (
                  <InterviewBotPanel
                    resumeId={resumeId}
                    jobTitle={jobTitle}
                    jobDescription={jobDescription}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <AlertCircle className="mb-3 h-8 w-8 text-amber-500" />
                    <p className="text-lg font-medium text-slate-200">Interview Setup Required</p>
                    <p className="text-sm">Please upload your resume and enter the target job details in the Setup view first.</p>
                  </div>
                )
              )}

              {activeTab === 'portfolio' && (
                <PortfolioPanel
                  githubAnalyzer={githubAnalyzer}
                  githubProfileUrl={githubProfileUrl}
                  isAnalyzing={isAnalyzingGithub}
                  onUrlChange={setGithubProfileUrl}
                  onAnalyze={handleAnalyzeGithubPortfolio}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}