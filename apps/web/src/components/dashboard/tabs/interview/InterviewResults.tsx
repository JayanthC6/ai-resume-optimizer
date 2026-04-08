import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import { 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Award, 
  MessageSquare, 
  Zap,
  Download
} from 'lucide-react';
import type { InterviewEvaluation, InterviewSession } from '@repo/types';

interface Props {
  evaluation: InterviewEvaluation;
  session: InterviewSession;
  onRestart: () => void;
}

export function InterviewResults({ evaluation, onRestart, session }: Props) {
  const getStrokeDashOffset = (score: number) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    return circumference - (score / 100) * circumference;
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    let y = 16;

    doc.setFontSize(16);
    doc.text('HiredLens Mock Interview Report', 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Role: ${session.jobTitle}`, 14, y);
    y += 7;
    doc.text(`Mode: ${session.mode}`, 14, y);
    y += 10;

    doc.text(`Overall Score: ${evaluation.overall_score}/100`, 14, y);
    y += 7;
    doc.text(`Technical Score: ${evaluation.technical_score}/100`, 14, y);
    y += 7;
    doc.text(`Communication Score: ${evaluation.communication_score}/100`, 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text('Core Strengths', 14, y);
    y += 7;
    doc.setFontSize(10);
    evaluation.core_strengths.forEach((s) => {
      const lines = doc.splitTextToSize(`- ${s}`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5;
    });

    y += 5;
    doc.setFontSize(12);
    doc.text('Areas For Improvement', 14, y);
    y += 7;
    doc.setFontSize(10);
    evaluation.areas_for_improvement.forEach((s) => {
      const lines = doc.splitTextToSize(`- ${s}`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5;
    });

    doc.save(`interview-report-${session.id}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Award className="h-4 w-4" /> Interview Completed
        </div>
        <h2 className="text-4xl font-black text-white">Performance Analysis</h2>
        <p className="text-slate-400">Detailed breakdown of your mock interview performance.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Overall Score', score: evaluation.overall_score, icon: Award, color: 'cyan' },
          { label: 'Technical Accuracy', score: evaluation.technical_score, icon: Zap, color: 'blue' },
          { label: 'Communication', score: evaluation.communication_score, icon: MessageSquare, color: 'indigo' },
        ].map((stat, idx) => (
          <Card key={idx} className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden group hover:border-slate-700 transition-colors">
            <CardContent className="pt-8 flex flex-col items-center">
              <div className="relative mb-6">
                <svg className="h-32 w-32 -rotate-90">
                  <circle
                    className="text-slate-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="36"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className={`transition-all duration-1000 ease-out ${
                        stat.score >= 80 ? 'text-emerald-500' : stat.score >= 60 ? 'text-amber-500' : 'text-rose-500'
                    }`}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 36}
                    strokeDashoffset={getStrokeDashOffset(stat.score || 0)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="36"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black text-white">{stat.score || 0}</span>
                </div>
              </div>
              <stat.icon className="h-5 w-5 text-slate-500 mb-2" />
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Strengths */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader className="bg-emerald-500/5 border-b border-slate-800">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-400">
              <TrendingUp className="h-5 w-5" /> Core Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {evaluation.core_strengths.map((str, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className="mt-1 h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed group-hover:text-white transition-colors">{str}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader className="bg-rose-500/5 border-b border-slate-800">
            <CardTitle className="text-lg flex items-center gap-2 text-rose-400">
              <TrendingUp className="h-5 w-5 rotate-180" /> Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {evaluation.areas_for_improvement.map((imp, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className="mt-1 h-5 w-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                  <XCircle className="h-3 w-3 text-rose-500" />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed group-hover:text-white transition-colors">{imp}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10 pb-12">
        <Button 
          onClick={onRestart}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto px-8 py-6 rounded-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all hover:scale-105"
        >
          Return to Setup
        </Button>
        <Button 
          size="lg"
          onClick={handleDownloadReport}
          className="w-full sm:w-auto px-10 py-6 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-900/20 transition-all hover:scale-105 active:scale-95"
        >
          Download PDF Report <Download className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
