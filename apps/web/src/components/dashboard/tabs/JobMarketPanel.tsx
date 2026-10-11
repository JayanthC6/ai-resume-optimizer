import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Briefcase, TrendingUp, History, ChevronDown } from 'lucide-react';
import api from '@/lib/api';

const PLACEHOLDER_COMPANIES = new Set([
  '',
  'n/a',
  'na',
  'notspecified',
  'unspecified',
  'unknown',
  'none',
  '-',
]);

function isPlaceholderCompany(company?: string | null): boolean {
  if (!company) return true;
  const normalized = company.toLowerCase().replace(/\s+/g, '');
  return PLACEHOLDER_COMPANIES.has(normalized);
}

function getFitDetails(score: number) {
  if (score >= 85) {
    return {
      label: 'Strong fit',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    };
  }
  if (score >= 70) {
    return {
      label: 'Moderate fit',
      textColor: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    };
  }
  return {
    label: 'Weak fit',
    textColor: 'text-red-600 dark:text-red-400',
    badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  };
}

export function JobMarketPanel({ resumeId }: { resumeId: string }) {
  const [jds, setJds] = useState<string[]>(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [loadingAnalysisId, setLoadingAnalysisId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const { data } = await api.get('/job-market');
      setHistory(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setHistoryError('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitial = async () => {
      try {
        const [latestRes] = await Promise.all([
          api.get('/job-market/latest'),
          fetchHistory(),
        ]);
        if (isMounted && latestRes?.data) {
          setResult(latestRes.data);
        }
      } catch (err: any) {
        // Silently handle if latest analysis fetch fails
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectAnalysis = async (id: string) => {
    setLoadingAnalysisId(id);
    try {
      const { data } = await api.get(`/job-market/${id}`);
      if (data) {
        setResult(data);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load analysis',
        variant: 'destructive',
      });
    } finally {
      setLoadingAnalysisId(null);
    }
  };

  const addJd = () => {
    if (jds.length >= 10) return;
    setJds([...jds, '']);
  };

  const removeJd = (index: number) => {
    if (jds.length <= 3) return;
    setJds(jds.filter((_, i) => i !== index));
  };

  const updateJd = (index: number, value: string) => {
    const newJds = [...jds];
    newJds[index] = value;
    setJds(newJds);
  };

  const handleAnalyze = async () => {
    const validJds = jds.filter(jd => jd.trim().length > 10);
    if (validJds.length < 3) {
      toast({
        title: 'Error',
        description: 'Please provide at least 3 valid Job Descriptions (min 10 chars each).',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/job-market/analyze', {
        resumeId,
        jobDescriptions: validJds,
      });
      setResult(data);
      fetchHistory();
      toast({
        title: 'Analysis Complete',
        description: 'Market gap analysis generated successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to analyze market gaps',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Job Market Gap Analysis</h2>
          <p className="text-muted-foreground mt-2">
            Paste 3 to 10 job descriptions to find missing keywords and get a fit ranking for each role.
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={loadingAnalysisId !== null}
              className="border-slate-200 dark:border-slate-800 shrink-0 text-xs font-medium"
            >
              {loadingAnalysisId ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-blue-500" />
              ) : historyLoading ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <History className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              )}
              Previous analyses
              <ChevronDown className="ml-1.5 h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 sm:w-80 max-w-[calc(100vw-2rem)] max-h-80 overflow-y-auto">
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
              Previous Analyses
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {historyLoading ? (
              <div className="py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading...
              </div>
            ) : historyError ? (
              <div className="py-3 px-3 text-center text-xs text-rose-500">
                {historyError}
                <button
                  onClick={fetchHistory}
                  className="block mx-auto mt-1 text-[11px] underline text-slate-400 hover:text-slate-200"
                >
                  Retry
                </button>
              </div>
            ) : history.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">No previous analyses</div>
            ) : (
              history.map((item) => {
                const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const jobCount = item.jobCount ?? item.numberOfJobs ?? 0;
                const jobsLabel = `${jobCount} ${jobCount === 1 ? 'job' : 'jobs'}`;

                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => handleSelectAnalysis(item.id)}
                    className="flex flex-col items-start gap-0.5 cursor-pointer py-2 focus:bg-slate-100 dark:focus:bg-slate-800 w-full overflow-hidden"
                  >
                    {item.topJobTitle ? (
                      <>
                        <div className="flex w-full items-center justify-between gap-2 text-xs font-medium">
                          <span
                            className="truncate text-slate-900 dark:text-slate-100"
                            title={item.topJobTitle}
                          >
                            {item.topJobTitle}
                          </span>
                          {item.topFitScore ? (
                            <span className="shrink-0 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              {item.topFitScore}% Top
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {formattedDate} • {jobsLabel}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex w-full items-center justify-between text-xs font-medium">
                          <span>{formattedDate}</span>
                          {item.topFitScore ? (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              {item.topFitScore}% Top
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {jobsLabel}
                        </span>
                      </>
                    )}
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {initialLoading ? (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading market analysis...</p>
        </Card>
      ) : !result ? (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle>Job Descriptions</CardTitle>
            <CardDescription>Minimum 3 required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {jds.map((jd, idx) => (
              <div key={idx} className="relative">
                <Textarea
                  placeholder={`Paste Job Description ${idx + 1} here...`}
                  value={jd}
                  onChange={(e) => updateJd(idx, e.target.value)}
                  className="min-h-[100px] pr-12 bg-slate-50 dark:bg-slate-900/50"
                />
                {jds.length > 3 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    onClick={() => removeJd(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <div className="flex gap-4">
              {jds.length < 10 && (
                <Button variant="outline" onClick={addJd} className="w-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Plus className="mr-2 h-4 w-4" /> Add Another JD
                </Button>
              )}
              <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Briefcase className="mr-2 h-4 w-4" />}
                Analyze Market Fit
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" onClick={() => setResult(null)} className="border-slate-200 dark:border-slate-800">
              Start New Analysis
            </Button>
            {result.createdAt && (
              <span className="text-xs text-muted-foreground">
                Analyzed on {new Date(result.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Missing Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.missingKeywords && result.missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((kw: string, i: number) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs font-medium px-2.5 py-1"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">None detected</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Priority Learning List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  {result.priorityList?.map((item: string, i: number) => (
                    <li key={i} className="text-sm">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-8 mb-4">Fit Rankings</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {result.jobTargets?.slice().sort((a: any, b: any) => b.fitRanking - a.fitRanking).map((target: any, i: number) => {
              const fit = getFitDetails(target.fitRanking);
              return (
                <Card key={i} className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold leading-tight flex items-start gap-2">
                      <span className="text-slate-400 font-mono shrink-0">#{i + 1}</span>
                      <span>{target.title}</span>
                    </CardTitle>
                    {!isPlaceholderCompany(target.company) && (
                      <CardDescription className="text-sm">{target.company}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                      <span className={`text-3xl font-bold ${fit.textColor}`}>
                        {target.fitRanking}%
                      </span>
                      <Badge variant="outline" className={`font-semibold ${fit.badgeClass}`}>
                        {fit.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed">
                      {target.jd}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
