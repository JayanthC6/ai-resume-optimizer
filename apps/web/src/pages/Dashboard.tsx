import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { OptimizationResponse } from '@repo/types';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'optimizing' | 'done'>('idle');
  const [result, setResult] = useState<OptimizationResponse | null>(null);

  const handleUploadAndAnalyze = async () => {
    if (!file || !jobTitle || !jobDescription) return alert('Fill all fields');
    setStatus('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload Resume parsing
      const { data: uploadRes } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus('optimizing');
      
      // Run AI Analysis
      const { data: analysisRes } = await api.post('/analysis/run', {
        resumeId: uploadRes.resumeId,
        jobTitle,
        jobDescription
      });

      setResult(analysisRes);
      setStatus('done');
    } catch (e) {
      console.error(e);
      alert('Optimization failed. Check logs.');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-6 border-b">
          <h1 className="text-3xl font-bold tracking-tight">Optimizer Workspace</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">Welcome, {user?.fullName || user?.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Resume & Job Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">1. Upload PDF Resume</label>
                <Input type="file" accept=".pdf" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">2. Target Job Title</label>
                <Input placeholder="e.g. Senior Frontend Engineer" value={jobTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobTitle(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">3. Job Description</label>
                <Textarea 
                  placeholder="Paste the job description here..." 
                  className="min-h-[200px]"
                  value={jobDescription} 
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)} 
                />
              </div>

              <Button 
                className="w-full h-12 text-md" 
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

          {/* AI Output Result */}
          <Card className="shadow-md bg-white border-primary/20">
            <CardHeader>
              <CardTitle>AI Optimization Results</CardTitle>
            </CardHeader>
            <CardContent>
              {!result && status !== 'done' ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                  <p>Upload a resume and job description to see the AI magic.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                    <span className="font-semibold text-lg">Match Score</span>
                    <Badge variant={result?.matchScore! > 80 ? 'default' : 'destructive'} className="text-lg px-3 py-1">
                      {result?.matchScore}%
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Gap Analysis (Missing Skills)</h3>
                    <div className="flex flex-wrap gap-2">
                      {result?.gapAnalysis?.missingSkills?.map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Suggested Summary Rewrite</h3>
                    <div className="p-4 bg-slate-900 text-slate-50 rounded-lg text-sm leading-relaxed">
                      {result?.rewrites?.summary}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Experience Bullets Enhancements</h3>
                    <div className="p-4 bg-slate-100 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                      {result?.rewrites?.experienceText}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
