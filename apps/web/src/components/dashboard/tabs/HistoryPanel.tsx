import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileText, ChevronRight, Activity, CalendarDays, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export type HistoryItem = {
  id: string;
  jobTitle: string;
  companyName: string | null;
  status: string;
  matchScore: number | null;
  atsScore: number | null;
  createdAt: string;
  resume: {
    originalFilename: string;
  };
};

type Props = {
  onSelectHistory: (analysisId: string) => void;
};

export function HistoryPanel({ onSelectHistory }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<HistoryItem[]>('/analysis/history');
      setHistory(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load past applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <Card className="w-full h-[600px] bg-slate-900 border-slate-800 shadow-xl flex items-center justify-center">
        <div className="flex flex-col items-center text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mb-4 text-cyan-400" />
          <p>Loading your past applications...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-[600px] bg-slate-900 border-slate-800 shadow-xl flex items-center justify-center">
        <div className="flex flex-col items-center text-rose-400">
          <p>{error}</p>
          <Button variant="outline" className="mt-4 border-slate-700 text-slate-300" onClick={fetchHistory}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="w-full h-[600px] bg-slate-900 border-slate-800 shadow-xl flex items-center justify-center">
        <div className="flex flex-col items-center text-slate-400">
          <Clock className="h-12 w-12 mb-4 text-slate-500" />
          <p className="text-lg font-medium text-slate-200">No past applications yet!</p>
          <p className="text-sm">Upload a resume and optimize it to see your history here.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full min-h-[600px] bg-slate-900 border-slate-800 shadow-xl flex flex-col">
      <CardHeader className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Past Applications
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">Review your previously optimized resumes and ATS scores.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchHistory} className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <div className="divide-y divide-slate-800/50">
          {history.map((item) => (
            <div 
              key={item.id} 
              className="p-6 hover:bg-slate-800/30 transition-colors group flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {item.jobTitle}
                  </h3>
                  {item.companyName && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700">
                      {item.companyName}
                    </span>
                  )}
                  {item.status === 'processing' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Processing
                    </span>
                  )}
                  {item.status === 'failed' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs">
                      Failed
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    {new Date(item.createdAt).toLocaleDateString(undefined, { 
                      month: 'short', day: 'numeric', year: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="truncate max-w-[200px]">{item.resume.originalFilename}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {item.status === 'completed' && (
                  <div className="flex items-center gap-4 border-r border-slate-800 pr-6 mr-2 hidden sm:flex">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-0.5">Match Score</div>
                      <div className="text-lg font-semibold text-emerald-400 flex items-center justify-end gap-1">
                        <Activity className="h-4 w-4" />
                        {item.matchScore}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-0.5">ATS Checks</div>
                      <div className="text-lg font-semibold text-sky-400">
                        {item.atsScore}%
                      </div>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={() => onSelectHistory(item.id)}
                  disabled={item.status !== 'completed'}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20"
                >
                  Review Match
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
