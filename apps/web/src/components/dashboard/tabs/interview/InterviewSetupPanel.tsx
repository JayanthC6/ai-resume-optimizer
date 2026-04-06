import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MessageSquare, Play, Code2, Briefcase } from 'lucide-react';

interface Props {
  onStart: (config: { mode: string; language: string; voiceEnabled: boolean }) => void;
  isLoading?: boolean;
}

const MODES = [
  { id: 'Behavioral', title: 'Behavioral', icon: MessageSquare, desc: 'Focus on soft skills, past experiences, and STAR method.' },
  { id: 'Technical', title: 'Technical', icon: Code2, desc: 'Deep dive into your tech stack, MCQs, and live coding.' },
  { id: 'Mixed', title: 'Mixed', icon: Briefcase, desc: 'A balanced session covering both behavioral and technical traits.' },
];

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'SQL'
];

export function InterviewSetupPanel({ onStart, isLoading }: Props) {
  const [mode, setMode] = useState('Mixed');
  const [language, setLanguage] = useState('JavaScript');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          AI Mock Interviewer
        </h2>
        <p className="text-slate-400 text-lg">
          Practice your dream role with our Senior Hiring Manager bot.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mode Selection */}
        <Card className="bg-slate-900/50 border-slate-800 shadow-xl backdrop-blur-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
               Select Interview Mode
            </CardTitle>
            <CardDescription className="text-slate-400">
              Choose the focus area for this session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MODES.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                    mode === m.id
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <m.icon className={`h-6 w-6 mb-3 ${mode === m.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <h3 className={`font-semibold mb-1 ${mode === m.id ? 'text-white' : 'text-slate-300'}`}>{m.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                  {mode === m.id && (
                    <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Voice Preference */}
        <Card className="bg-slate-900/50 border-slate-800 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
               Communication Preference
            </CardTitle>
            <CardDescription className="text-slate-400">
              How would you like to respond to questions?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup 
              value={voiceEnabled ? 'voice' : 'text'} 
              onValueChange={(val: string) => setVoiceEnabled(val === 'voice')}
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="text-only"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-slate-800/50 ${
                  !voiceEnabled ? 'border-cyan-500 bg-slate-800' : 'border-slate-800'
                }`}
              >
                <RadioGroupItem value="text" id="text-only" className="sr-only" />
                <MessageSquare className={`h-6 w-6 mb-2 ${!voiceEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-sm font-medium">Text Based</span>
              </Label>
              <Label
                htmlFor="voice-enabled"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-slate-800/50 ${
                  voiceEnabled ? 'border-cyan-500 bg-slate-800' : 'border-slate-800'
                }`}
              >
                <RadioGroupItem value="voice" id="voice-enabled" className="sr-only" />
                <Mic className={`h-6 w-6 mb-2 ${voiceEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-sm font-medium">Voice Enabled</span>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Coding Language */}
        <Card className="bg-slate-900/50 border-slate-800 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
               Coding Language
            </CardTitle>
            <CardDescription className="text-slate-400">
              For technical queries and live coding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-8">
        <Button 
          size="lg" 
          onClick={() => onStart({ mode, language, voiceEnabled })}
          disabled={isLoading}
          className="px-12 py-6 text-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-full shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all hover:scale-105 active:scale-95 group"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Preparing Room...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Start Interview <Play className="h-5 w-5 fill-current group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
