import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Briefcase, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

export function JobMarketPanel({ resumeId }: { resumeId: string }) {
  const [jds, setJds] = useState<string[]>(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

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
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Job Market Gap Analysis</h2>
          <p className="text-muted-foreground mt-2">
            Paste 3 to 10 job descriptions to find missing keywords and get a fit ranking for each role.
          </p>
        </div>
      </div>

      {!result ? (
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
          <Button variant="outline" onClick={() => setResult(null)} className="border-slate-200 dark:border-slate-800">
            Start New Analysis
          </Button>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Missing Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  {result.missingKeywords?.map((kw: string, i: number) => (
                    <li key={i} className="text-sm">{kw}</li>
                  ))}
                </ul>
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
            {result.jobTargets?.slice().sort((a: any, b: any) => b.fitRanking - a.fitRanking).map((target: any, i: number) => (
              <Card key={i} className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold leading-tight flex items-start gap-2">
                    <span className="text-slate-400 font-mono shrink-0">#{i + 1}</span>
                    <span>{target.title}</span>
                  </CardTitle>
                  {target.company && target.company.trim() !== '' && target.company.toLowerCase() !== 'n/a' && (
                    <CardDescription className="text-sm">{target.company}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                    {target.fitRanking}% Fit
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed">
                    {target.jd}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
