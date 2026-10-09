import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle2, Circle, Clock, Flame } from 'lucide-react';
import api from '@/lib/api';

type PlanTask = {
  id: string;
  phase: string;
  title: string;
  description: string | null;
  status: string;
};

type Progress = {
  total: number;
  completed: number;
};

type TaskData = {
  day30: PlanTask[];
  day60: PlanTask[];
  day90: PlanTask[];
  progress: Progress;
};

type Props = {
  analysisId: string;
};

export function PlanTrackerPanel({ analysisId }: Props) {
  const [data, setData] = useState<TaskData | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (analysisId) {
      fetchTasks();
      fetchStreak();
    }
  }, [analysisId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/plan-tracker/${analysisId}`);
      setData(res.data);
    } catch (e: any) {
      console.error(e);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStreak = async () => {
    try {
      const res = await api.get(`/plan-tracker/streak`);
      setStreak(res.data.streak);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      await api.post(`/plan-tracker/sync/${analysisId}`);
      await fetchTasks();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to sync tasks from analysis.');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleTask = async (task: PlanTask) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    
    // Optimistic update
    const phaseKey = task.phase as keyof TaskData;
    const currentList = data?.[phaseKey] as PlanTask[];
    
    const updatedList = currentList.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
    
    setData(prev => {
      if (!prev) return prev;
      const completedDiff = newStatus === 'done' ? 1 : -1;
      return {
        ...prev,
        [phaseKey]: updatedList,
        progress: {
          ...prev.progress,
          completed: prev.progress.completed + completedDiff
        }
      };
    });

    try {
      await api.patch(`/plan-tracker/tasks/${task.id}`, { status: newStatus });
      fetchStreak(); // Refresh streak in case it changed
    } catch (e: any) {
      setError('Failed to update task.');
      fetchTasks(); // Revert on failure
    }
  };

  const renderPhase = (title: string, phaseKey: keyof TaskData) => {
    const tasks = data?.[phaseKey] as PlanTask[] | undefined;
    if (!tasks || tasks.length === 0) {
      return (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500 text-center py-6">No tasks for this phase.</div>
          </CardContent>
        </Card>
      );
    }

    const completed = tasks.filter(t => t.status === 'done').length;
    const percent = Math.round((completed / tasks.length) * 100) || 0;

    return (
      <Card className="border-slate-200 dark:border-slate-800 flex flex-col h-full">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            <span className="text-sm font-medium text-slate-500">{completed}/{tasks.length}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex-1 overflow-y-auto">
          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => handleToggleTask(task)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${task.status === 'done' ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
              >
                <div className="mt-0.5 shrink-0">
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p>Loading your plan...</p>
      </div>
    );
  }

  const overallPercent = data?.progress.total ? Math.round((data.progress.completed / data.progress.total) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Plan Tracker</h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
              <Flame className="w-4 h-4" />
              {streak} Day Streak
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your progress on the generated 30-60-90 day skill gap roadmap.
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
          {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Sync Tasks from Analysis
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {data && data.progress.total === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Clock className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Tasks Found</h3>
          <p className="text-center max-w-sm mb-6">
            Click 'Sync Tasks' to read your latest skill gap roadmap and create trackable tasks.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Progress</span>
                <span className="text-sm font-medium text-blue-600">{overallPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${overallPercent}%` }}></div>
              </div>
            </div>
            <div className="shrink-0 text-sm text-slate-500 font-medium px-4 border-l border-slate-200 dark:border-slate-700">
              {data?.progress.completed} / {data?.progress.total} Tasks Completed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {renderPhase('First 30 Days', 'day30')}
            {renderPhase('Days 31-60', 'day60')}
            {renderPhase('Days 61-90', 'day90')}
          </div>
        </>
      )}
    </div>
  );
}
