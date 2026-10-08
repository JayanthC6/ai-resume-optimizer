import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { DashboardSidebar, type TabKey } from '@/components/dashboard/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, KeyRound, FileEdit, Map, HelpCircle, 
  Mic, FolderSearch, TrendingUp, AlertCircle, ArrowRight, Clock, LayoutDashboard
} from 'lucide-react';

export default function UserHome() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [history, setHistory] = useState<Array<{ id: string, jobTitle: string, companyName: string, matchScore: number, atsScore: number, createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(false);
      const { data } = await api.get('/analysis/history');
      setHistory(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabKey) => {
    if (tab === 'home') return;
    navigate(`/dashboard?tab=${tab}`);
  };

  const handleOpenAnalysis = (id: string) => {
    navigate(`/dashboard?tab=overview&analysisId=${id}`);
  };

  const latestAnalysis = history.length > 0 ? history[0] : null;
  const totalAnalyses = history.length;
  
  const FEATURES = [
    { icon: FileText, title: 'Resume Analysis', desc: 'Score your resume against any JD.', tab: 'overview' as TabKey },
    { icon: TrendingUp, title: 'Market Gap', desc: 'Compare against multiple jobs.', tab: 'job-market' as TabKey },
    { icon: KeyRound, title: 'Keywords', desc: 'Optimize your ATS keywords.', tab: 'keywords' as TabKey },
    { icon: FileEdit, title: 'Rewrites', desc: 'AI-powered resume editing.', tab: 'rewrites' as TabKey },
    { icon: Map, title: 'Skill Roadmap', desc: '30-60-90 day learning plans.', tab: 'roadmap' as TabKey },
    { icon: HelpCircle, title: 'Q&A Prep', desc: 'Predict interview questions.', tab: 'interview' as TabKey },
    { icon: Mic, title: 'Mock Interview', desc: 'Practice with an AI recruiter.', tab: 'mock-interview' as TabKey },
    { icon: FolderSearch, title: 'Portfolio', desc: 'Analyze your GitHub projects.', tab: 'portfolio' as TabKey },
  ];

  const suggestedNextAction = history.length === 0 
    ? { title: 'Run your first analysis', desc: 'Upload your resume and paste a job description to get started.', action: () => navigate('/dashboard') }
    : { title: 'Practice for your next interview', desc: 'Try a mock interview based on your latest target role.', action: () => handleTabChange('mock-interview') };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--dash-bg)', transition: 'background 200ms ease' }}>
      <DashboardSidebar activeTab="home" onTabChange={handleTabChange} onNewAnalysis={() => navigate('/dashboard')} />

      <main className="flex-1 overflow-y-auto p-6 lg:p-10" style={{ background: 'var(--dash-bg)', transition: 'background 200ms ease' }}>
        <div className="max-w-6xl mx-auto space-y-10 pb-12">
          
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl p-8 lg:p-12 text-white shadow-xl bg-gradient-to-br from-blue-600 to-cyan-500">
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Candidate'}!
              </h1>
              <p className="text-blue-100 text-lg mb-8">
                Your AI-powered career intelligence center. Analyze resumes, discover skill gaps, and practice interviews to land your next dream role.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="secondary" onClick={() => navigate('/dashboard')} className="font-semibold text-blue-600">
                  Analyze a resume
                </Button>
                <Button size="lg" variant="outline" onClick={() => handleTabChange('job-market')} className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                  Compare multiple jobs
                </Button>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
              <SparklesIcon className="w-96 h-96" />
            </div>
          </section>

          {loading ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-800 h-32 rounded-xl" />)}
              </div>
              <div className="animate-pulse bg-slate-200 dark:bg-slate-800 h-64 rounded-xl" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <AlertCircle className="w-12 h-12 mb-4 text-rose-500" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Failed to load dashboard data</h3>
              <Button variant="outline" onClick={fetchData}>Try again</Button>
            </div>
          ) : (
            <>
              {/* Stats & Next Action */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Analyses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalAnalyses}</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Latest Match Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{latestAnalysis?.matchScore || 0}%</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Latest ATS Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{latestAnalysis?.atsScore || 0}%</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="shadow-sm border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Suggested Next Step</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="font-medium text-slate-900 dark:text-white">{suggestedNextAction.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{suggestedNextAction.desc}</p>
                    <Button size="sm" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={suggestedNextAction.action}>
                      Go <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Analyses */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" /> Recent Activity
                  </h3>
                  {history.length === 0 ? (
                    <Card className="shadow-sm bg-slate-50/50 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800">
                      <CardContent className="p-8 text-center text-slate-500">
                        No recent activity. Start by analyzing your resume.
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {history.slice(0, 5).map(item => (
                        <button 
                          key={item.id} 
                          onClick={() => handleOpenAnalysis(item.id)}
                          className="w-full text-left bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-slate-900 dark:text-white truncate pr-4">{item.jobTitle}</span>
                            <span className="text-xs font-medium text-slate-400 whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm font-medium">
                            <span className="text-blue-600 dark:text-blue-400">Match: {item.matchScore}%</span>
                            <span className="text-emerald-600 dark:text-emerald-400">ATS: {item.atsScore}%</span>
                          </div>
                        </button>
                      ))}
                      {history.length > 5 && (
                        <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={() => handleTabChange('history')}>
                          View all history
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Features Grid */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-slate-400" /> Tool Suite
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FEATURES.map(feat => {
                      const Icon = feat.icon;
                      return (
                        <button 
                          key={feat.tab}
                          onClick={() => handleTabChange(feat.tab)}
                          className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left group"
                        >
                          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {feat.title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {feat.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="pt-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">How it works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { step: '1', title: 'Upload & Target', desc: 'Upload your current resume PDF and provide the specific job description you want to land.' },
                    { step: '2', title: 'AI Analysis', desc: 'Our engine scores your resume for ATS compatibility and match rate, identifying critical missing keywords.' },
                    { step: '3', title: 'Optimize & Prep', desc: 'Get AI-written bullet points, a personalized skill roadmap, and tailored interview questions.' }
                  ].map(step => (
                    <div key={step.step} className="text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center font-bold text-xl mx-auto">
                        {step.step}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{step.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.64 2.809a.75.75 0 01.72 0l2.36 1.362a.75.75 0 00.75 0l2.36-1.362a.75.75 0 011.08.625v2.723a.75.75 0 00.375.65l2.36 1.362a.75.75 0 01.36.85l-1.36 2.358a.75.75 0 000 .75l1.36 2.358a.75.75 0 01-.36.85l-2.36 1.362a.75.75 0 00-.375.65v2.723a.75.75 0 01-1.08.625l-2.36-1.362a.75.75 0 00-.75 0l-2.36 1.362a.75.75 0 01-1.08-.625v-2.723a.75.75 0 00-.375-.65l-2.36-1.362a.75.75 0 01-.36-.85l1.36-2.358a.75.75 0 000-.75l-1.36-2.358a.75.75 0 01.36-.85l2.36-1.362a.75.75 0 00.375-.65V3.434a.75.75 0 01.36-.625zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
    </svg>
  );
}
