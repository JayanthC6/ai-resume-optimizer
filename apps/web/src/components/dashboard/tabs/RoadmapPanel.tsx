import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, Code2, Map, Rocket, Target, Trophy } from 'lucide-react';
import type { SkillGapRoadmap } from '@repo/types';

type Props = {
  skillGapRoadmap: SkillGapRoadmap | null;
  isGenerating: boolean;
  onGenerate: () => void;
};

const phaseConfig = [
  { gradient: 'from-sky-500 to-sky-600', bg: 'bg-sky-500', ring: 'ring-sky-200 dark:ring-sky-900', label: 'Foundation', icon: <Target className="h-4 w-4" />, accent: 'sky' },
  { gradient: 'from-cyan-500 to-teal-500', bg: 'bg-cyan-500', ring: 'ring-cyan-200 dark:ring-cyan-900', label: 'Acceleration', icon: <Rocket className="h-4 w-4" />, accent: 'cyan' },
  { gradient: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-500', ring: 'ring-indigo-200 dark:ring-indigo-900', label: 'Mastery', icon: <Trophy className="h-4 w-4" />, accent: 'indigo' },
];

function formatTimeframe(value: string) {
  if (value === '30_days') return 'Days 1–30';
  if (value === '60_days') return 'Days 31–60';
  if (value === '90_days') return 'Days 61–90';
  return value.replace('_', '–');
}

export function RoadmapPanel({ skillGapRoadmap, isGenerating, onGenerate }: Props) {
  if (!skillGapRoadmap) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 dark:border-slate-700 dark:bg-slate-900/50">
        <Map className="mb-3 h-8 w-8 text-slate-400 dark:text-slate-500" />
        <h3 className="mb-1 text-base font-semibold text-slate-700 dark:text-slate-300">Build Your Skill Roadmap</h3>
        <p className="mb-5 max-w-sm text-center text-sm text-slate-500 dark:text-slate-400">
          Get a focused 30/60/90-day plan with bite-sized goals, resources, and projects.
        </p>
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-200 hover:from-sky-700 hover:to-cyan-700 dark:shadow-sky-900/30"
        >
          {isGenerating ? 'Generating...' : 'Generate Roadmap'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Skills to focus */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-rose-50/20 to-white p-5 dark:border-slate-800 dark:from-slate-900 dark:via-rose-950/10 dark:to-slate-900">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          <Target className="h-4 w-4 text-rose-500" />
          Skills to Focus On
        </h3>
        <div className="flex flex-wrap gap-2">
          {skillGapRoadmap.missingSkills.map((skill, idx) => (
            <Badge key={idx} className="border-rose-200 bg-rose-50 px-3 py-1 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 hidden h-full w-0.5 bg-gradient-to-b from-sky-400 via-cyan-400 to-indigo-400 md:block" />

        <div className="space-y-6">
          {skillGapRoadmap.phases.map((phase, idx) => {
            const config = phaseConfig[idx] || phaseConfig[0];
            return (
              <div key={idx} className="relative md:pl-16">
                {/* Timeline dot */}
                <div className={`absolute left-4 top-5 z-10 hidden h-5 w-5 items-center justify-center rounded-full ${config.bg} text-white ring-4 ${config.ring} md:flex`}>
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
                  {/* Phase header */}
                  <div className={`flex items-center justify-between rounded-t-2xl bg-gradient-to-r ${config.gradient} px-5 py-3`}>
                    <div className="flex items-center gap-2 text-white">
                      {config.icon}
                      <span className="text-sm font-bold">{formatTimeframe(phase.timeframe)}</span>
                      <span className="text-xs font-medium opacity-80">· {config.label}</span>
                    </div>
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                      Phase {idx + 1}
                    </span>
                  </div>

                  {/* Phase content — compact 3-column grid */}
                  <div className="grid gap-px bg-slate-100 dark:bg-slate-800 md:grid-cols-3">
                    {/* Goals */}
                    <div className="bg-white p-4 dark:bg-slate-900">
                      <div className="mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Goals</p>
                      </div>
                      <ul className="space-y-1.5">
                        {phase.goals.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-slate-700 dark:text-slate-300">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-sky-400" />
                            <span className="line-clamp-2">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Resources */}
                    <div className="bg-white p-4 dark:bg-slate-900">
                      <div className="mb-2 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-cyan-500" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Learn</p>
                      </div>
                      <ul className="space-y-1.5">
                        {phase.learningResources.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-slate-700 dark:text-slate-300">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                            <span className="line-clamp-2">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Projects */}
                    <div className="bg-white p-4 md:rounded-br-2xl dark:bg-slate-900">
                      <div className="mb-2 flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5 text-indigo-500" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Build</p>
                      </div>
                      <ul className="space-y-1.5">
                        {phase.miniProjects.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-slate-700 dark:text-slate-300">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                            <span className="line-clamp-2">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom motivational note */}
      <div className="rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 text-center dark:border-sky-900 dark:from-sky-950/30 dark:to-cyan-950/30">
        <p className="text-sm font-medium text-sky-800 dark:text-sky-300">
          🎯 Focus on <span className="font-bold">one phase at a time</span>. Consistency beats speed.
        </p>
      </div>
    </div>
  );
}
