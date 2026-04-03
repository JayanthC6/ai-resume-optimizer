import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { LogOut, Sparkles, Target, UploadCloud } from 'lucide-react';

type Props = {
  file: File | null;
  jobTitle: string;
  jobDescription: string;
  status: 'idle' | 'uploading' | 'optimizing' | 'done';
  onFileSelect: (file?: File | null) => void;
  onJobTitleChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  userName?: string;
  onLogout: () => void;
  fileName?: string;
};

export function SetupView({
  file,
  jobTitle,
  jobDescription,
  status,
  onFileSelect,
  onJobTitleChange,
  onJobDescriptionChange,
  onSubmit,
  userName,
  onLogout,
  fileName,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    onFileSelect(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-6 py-8 sm:px-10">
      {/* Background blurs */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/5" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/5" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-300/10 blur-3xl dark:bg-indigo-500/5" />

      {/* Top bar */}
      <div className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-200 dark:shadow-sky-900/30">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">HiredLens</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Optimization Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {userName && (
            <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:inline">
              {userName}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="rounded-full border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Main form */}
      <div className="relative z-10 mx-auto mt-8 flex w-full max-w-3xl flex-1 flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Analyze Your Resume
          </h1>
          <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
            Upload your resume, paste the job description, and let AI do the heavy lifting.
          </p>
        </div>

        <Card className="w-full border-white/70 bg-white/90 shadow-2xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-white">
              <Target className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              Resume & Job Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* File upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                1. Upload PDF Resume
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-5 transition-all duration-200 ${
                  isDragging
                    ? 'border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/30'
                    : 'border-slate-200 bg-slate-50 hover:border-sky-400 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-sky-600'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => onFileSelect(e.target.files?.[0])}
                />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {file ? file.name : (fileName ? fileName : 'Drag and drop PDF here')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : (fileName ? 'Previously uploaded' : 'or click to browse')}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="rounded-full dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <UploadCloud className="h-4 w-4" />
                    Browse
                  </Button>
                </div>
              </div>
            </div>

            {/* Job title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                2. Target Job Title
              </label>
              <Input
                placeholder="e.g. Senior Frontend Engineer"
                className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                value={jobTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onJobTitleChange(e.target.value)}
              />
            </div>

            {/* Job description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                3. Job Description
              </label>
              <Textarea
                placeholder="Paste the complete job description here..."
                className="min-h-[200px] rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                value={jobDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onJobDescriptionChange(e.target.value)}
              />
            </div>

            {/* Submit button */}
            <Button
              className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-md font-semibold text-white shadow-lg shadow-sky-200 transition-all hover:from-sky-700 hover:to-cyan-700 dark:shadow-sky-900/30"
              onClick={onSubmit}
              disabled={status === 'uploading' || status === 'optimizing'}
            >
              <Sparkles className="h-4 w-4" />
              {status === 'idle' && 'Analyze & Optimize Resume'}
              {status === 'uploading' && 'Uploading PDF...'}
              {status === 'optimizing' && 'AI Engines Running...'}
              {status === 'done' && 'Re-run Analysis'}
            </Button>

            {(status === 'uploading' || status === 'optimizing') && (
              <div className="space-y-2">
                <Progress value={status === 'uploading' ? 30 : 80} className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  {status === 'uploading' ? 'Uploading your resume...' : 'Running AI analysis engines...'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
