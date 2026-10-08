import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, Copy, CheckCircle2, Save, Trash2, Edit2, X, PlusCircle } from 'lucide-react';
import api from '@/lib/api';

type Draft = {
  id: string;
  type: string;
  tone: string;
  length: string;
  title: string;
  content: string;
  createdAt: string;
};

type Props = {
  analysisId: string;
};

export function OutreachPanel({ analysisId }: Props) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [activeDraft, setActiveDraft] = useState<Draft | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [type, setType] = useState('cover_letter');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');

  // Edit State
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (analysisId) {
      fetchDrafts();
    }
  }, [analysisId]);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/outreach?analysisId=${analysisId}`);
      setDrafts(data || []);
    } catch (e: any) {
      console.error(e);
      setError('Failed to fetch drafts.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post(`/outreach/generate`, {
        analysisId,
        type,
        tone,
        length,
      });
      
      const newDraft = data;
      setDrafts([newDraft, ...drafts]);
      setActiveDraft(newDraft);
      setEditTitle(newDraft.title);
      setEditContent(newDraft.content);
      setIsCreating(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to generate outreach.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activeDraft) return;
    try {
      setSaveLoading(true);
      const { data } = await api.patch(`/outreach/${activeDraft.id}`, {
        title: editTitle,
        content: editContent,
      });
      
      setDrafts(drafts.map(d => d.id === data.id ? data : d));
      setActiveDraft(data);
      setIsEditing(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save draft.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/outreach/${id}`);
      setDrafts(drafts.filter(d => d.id !== id));
      if (activeDraft?.id === id) {
        setActiveDraft(null);
      }
    } catch (e: any) {
      setError('Failed to delete draft.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!activeDraft) return;
    navigator.clipboard.writeText(isEditing ? editContent : activeDraft.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatType = (val: string) => val.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  if (loading && drafts.length === 0 && !isCreating) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p>Loading your outreach drafts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Outreach Generator</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create tailored cover letters and messages based on your resume and target job.
          </p>
        </div>
        <Button onClick={() => { setIsCreating(true); setActiveDraft(null); }} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
          <PlusCircle className="w-4 h-4 mr-2" />
          New Draft
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Saved Drafts</h3>
          {drafts.length === 0 ? (
            <div className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-900 p-6 rounded-lg text-center border border-slate-200 dark:border-slate-800">
              No drafts yet. Create one to get started!
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {drafts.map(draft => (
                <div 
                  key={draft.id} 
                  onClick={() => {
                    setActiveDraft(draft);
                    setIsCreating(false);
                    setEditTitle(draft.title);
                    setEditContent(draft.content);
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${activeDraft?.id === draft.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate pr-2">{draft.title}</h4>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(draft.id); }} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 text-xs text-slate-500">
                    <span className="capitalize">{formatType(draft.type)}</span>
                    <span>•</span>
                    <span>{new Date(draft.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {isCreating ? (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">Generate New Outreach</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                    className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                  >
                    <option value="cover_letter">Cover Letter</option>
                    <option value="recruiter_message">Recruiter Message</option>
                    <option value="follow_up_email">Follow Up Email</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tone</label>
                    <select 
                      value={tone} 
                      onChange={e => setTone(e.target.value)}
                      className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm capitalize"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="confident">Confident</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Length</label>
                    <select 
                      value={length} 
                      onChange={e => setLength(e.target.value)}
                      className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm capitalize"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4 border-slate-100 dark:border-slate-800">
                <Button variant="ghost" onClick={() => { setIsCreating(false); if(drafts.length > 0) setActiveDraft(drafts[0]); }}>Cancel</Button>
                <Button onClick={handleGenerate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Generate
                </Button>
              </CardFooter>
            </Card>
          ) : activeDraft ? (
            <Card className="border-slate-200 dark:border-slate-800 h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-100 dark:border-slate-800">
                {isEditing ? (
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="font-semibold text-lg bg-transparent border-b border-blue-500 focus:outline-none w-2/3"
                  />
                ) : (
                  <CardTitle className="text-lg">{activeDraft.title}</CardTitle>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy
                  </Button>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditTitle(activeDraft.title); setEditContent(activeDraft.content); }}>
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={saveLoading} className="bg-blue-600 text-white hover:bg-blue-700">
                        {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="w-full h-full min-h-[400px] p-6 bg-transparent resize-none focus:outline-none text-sm text-slate-700 dark:text-slate-300"
                  />
                ) : (
                  <div className="p-6 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono bg-slate-50 dark:bg-slate-900/50 h-full min-h-[400px] rounded-b-xl overflow-y-auto">
                    {activeDraft.content}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
             <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 h-full">
              <Mail className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Draft Selected</h3>
              <p className="text-center max-w-sm mb-6">
                Select a draft from the sidebar to view or edit, or create a new one.
              </p>
              <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                Create New Draft
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
