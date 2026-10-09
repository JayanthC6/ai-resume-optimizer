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

    if (!roadmap || !roadmap.day30 || !roadmap.day60 || !roadmap.day90) {
      throw new BadRequestException('Roadmap not found or invalid format in analysis');
    }

    const phases = ['day30', 'day60', 'day90'];
    const upsertedTasks = [];

    for (const phase of phases) {
      const tasks = roadmap[phase] || [];
      for (let i = 0; i < tasks.length; i++) {
        const title = typeof tasks[i] === 'string' ? tasks[i] : tasks[i].title || tasks[i].task;
        const description = tasks[i].description || null;

        if (!title) continue;

        const task = await this.prisma.planTask.upsert({
          where: {
            analysisId_phase_title: {
              analysisId,
              phase,
              title: title.substring(0, 255),
            },
          },
          update: {
            description,
            sortOrder: i,
          },
          create: {
            userId,
            analysisId,
            phase,
            title: title.substring(0, 255),
            description,
            status: 'todo',
            sortOrder: i,
          },
        });
        upsertedTasks.push(task);
      }
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
