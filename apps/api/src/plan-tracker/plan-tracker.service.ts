import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class PlanTrackerService {
  constructor(private prisma: PrismaService) {}

  async syncRoadmapTasks(userId: string, analysisId: string) {
    const analysis = await this.prisma.analysis.findFirst({
      where: { id: analysisId, resume: { userId } },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    const rewrites = analysis.rewrites as any;
    const roadmap = rewrites?.skillGapRoadmap;

    if (!roadmap) {
      throw new BadRequestException('Roadmap not found in analysis');
    }

    type TaskCandidate = {
      phase: string;
      title: string;
      description: string | null;
      sortOrder: number;
    };

    const taskCandidates: TaskCandidate[] = [];

    if (Array.isArray(roadmap.phases)) {
      roadmap.phases.forEach((phaseObj: any, index: number) => {
        let phaseKey = 'day30';
        const timeframe = (phaseObj?.timeframe ?? '').toString().toLowerCase();

        if (timeframe.includes('30')) {
          phaseKey = 'day30';
        } else if (timeframe.includes('60')) {
          phaseKey = 'day60';
        } else if (timeframe.includes('90')) {
          phaseKey = 'day90';
        } else {
          phaseKey = index === 0 ? 'day30' : index === 1 ? 'day60' : 'day90';
        }

        const resources = Array.isArray(phaseObj?.learningResources)
          ? phaseObj.learningResources.filter(Boolean).map((r: any) => String(r).trim()).filter(Boolean).join(', ')
          : '';

        let order = 0;

        // Goals
        if (Array.isArray(phaseObj?.goals)) {
          phaseObj.goals.forEach((goal: any) => {
            const rawTitle = typeof goal === 'string' ? goal : goal?.title || goal?.goal || '';
            const title = String(rawTitle).trim();
            if (!title) return;

            const description = resources
              ? `Goal. Resources: ${resources}`
              : 'Goal';

            taskCandidates.push({
              phase: phaseKey,
              title: title.substring(0, 255),
              description,
              sortOrder: order++,
            });
          });
        }

        // MiniProjects
        if (Array.isArray(phaseObj?.miniProjects)) {
          phaseObj.miniProjects.forEach((proj: any) => {
            const rawTitle = typeof proj === 'string' ? proj : proj?.title || proj?.project || '';
            const title = String(rawTitle).trim();
            if (!title) return;

            taskCandidates.push({
              phase: phaseKey,
              title: title.substring(0, 255),
              description: 'Mini project',
              sortOrder: order++,
            });
          });
        }
      });
    } else {
      // Fallback if day30, day60, day90 exist directly
      const directPhases = ['day30', 'day60', 'day90'];
      for (const phaseKey of directPhases) {
        if (Array.isArray(roadmap[phaseKey])) {
          let order = 0;
          for (const item of roadmap[phaseKey]) {
            const rawTitle = typeof item === 'string' ? item : item?.title || item?.task || '';
            const title = String(rawTitle).trim();
            if (!title) continue;

            taskCandidates.push({
              phase: phaseKey,
              title: title.substring(0, 255),
              description: item?.description || 'Goal',
              sortOrder: order++,
            });
          }
        }
      }
    }

    if (taskCandidates.length === 0) {
      throw new BadRequestException('Roadmap has no valid tasks or invalid format in analysis');
    }

    // Deduplicate candidates with identical (phase, title) to respect unique constraint
    const seen = new Set<string>();
    const uniqueCandidates = taskCandidates.filter((item) => {
      const key = `${item.phase}:::${item.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const upsertedTasks = [];
    for (const item of uniqueCandidates) {
      const task = await this.prisma.planTask.upsert({
        where: {
          analysisId_phase_title: {
            analysisId,
            phase: item.phase,
            title: item.title,
          },
        },
        update: {
          description: item.description,
          sortOrder: item.sortOrder,
        },
        create: {
          userId,
          analysisId,
          phase: item.phase,
          title: item.title,
          description: item.description,
          status: 'todo',
          sortOrder: item.sortOrder,
        },
      });
      upsertedTasks.push(task);
    }

    return { success: true, count: upsertedTasks.length };
  }

  async getTasks(userId: string, analysisId: string) {
    const analysis = await this.prisma.analysis.findFirst({
      where: { id: analysisId, resume: { userId } },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    const tasks = await this.prisma.planTask.findMany({
      where: { analysisId, userId },
      orderBy: { sortOrder: 'asc' },
    });

    const result = {
      day30: tasks.filter(t => t.phase === 'day30'),
      day60: tasks.filter(t => t.phase === 'day60'),
      day90: tasks.filter(t => t.phase === 'day90'),
      progress: {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'done').length,
      },
    };

    return result;
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.planTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const completedAt = dto.status === 'done' ? new Date() : null;

    return this.prisma.planTask.update({
      where: { id: taskId },
      data: {
        status: dto.status,
        completedAt: dto.status === 'done' && task.status !== 'done' ? new Date() : (dto.status === 'done' ? task.completedAt : null),
      },
    });
  }

  async getStreak(userId: string) {
    // A streak is the number of consecutive days (up to today or yesterday) 
    // where at least one task was completed.
    const completedTasks = await this.prisma.planTask.findMany({
      where: { userId, status: 'done', completedAt: { not: null } },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
    });

    if (completedTasks.length === 0) return { streak: 0 };

    const dates = completedTasks.map(t => {
      const d = new Date(t.completedAt!);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });

    const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    const yesterdayTime = todayTime - 86400000;

    let currentDateToCheck = uniqueDates[0] === todayTime ? todayTime : (uniqueDates[0] === yesterdayTime ? yesterdayTime : null);

    if (currentDateToCheck === null) {
      return { streak: 0 };
    }

    for (const dt of uniqueDates) {
      if (dt === currentDateToCheck) {
        streak++;
        currentDateToCheck -= 86400000; // go back 1 day
      } else if (dt < currentDateToCheck) {
        break;
      }
    }

    return { streak };
  }
}
