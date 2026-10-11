import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { AnalyzeMarketDto } from './dto/analyze-market.dto';
import { RedisService } from '../redis/redis.service';
import * as crypto from 'crypto';

@Injectable()
export class JobMarketService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private redisService: RedisService,
  ) {}

  async analyzeMarket(userId: string, dto: AnalyzeMarketDto) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: dto.resumeId, userId },
    });

    if (!resume || !resume.rawText) {
      throw new NotFoundException('Resume not found or not parsed');
    }

    const inputHash = crypto
      .createHash('sha256')
      .update(resume.rawText + JSON.stringify(dto.jobDescriptions))
      .digest('hex');

    const cacheKey = `job-market:${userId}:${inputHash}`;
    const cached = await this.redisService.get(cacheKey);

    let aiResult;
    if (cached) {
      aiResult = JSON.parse(cached);
    } else {
      aiResult = await this.aiService.analyzeJobMarket(
        resume.rawText,
        dto.jobDescriptions,
      );
      await this.redisService.set(cacheKey, JSON.stringify(aiResult), 86400); // 24h cache
    }

    const jobTarget = await this.prisma.jobTarget.create({
      data: {
        userId,
        resumeId: resume.id,
        jobTargets: aiResult.jobTargets,
        missingKeywords: aiResult.missingKeywords,
        priorityList: aiResult.priorityList,
      },
    });

    return jobTarget;
  }

  async getLatest(userId: string) {
    const latest = await this.prisma.jobTarget.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return latest;
  }

  async getAll(userId: string) {
    const items = await this.prisma.jobTarget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return items.map((item) => {
      const jobs = Array.isArray(item.jobTargets) ? (item.jobTargets as any[]) : [];
      let topJobTitle: string | null = null;
      let topFitScore = 0;

      if (jobs.length > 0) {
        let highestScore = -Infinity;
        let highestJob: any = null;

        for (const job of jobs) {
          if (job && typeof job === 'object') {
            const score =
              typeof job.fitRanking === 'number'
                ? job.fitRanking
                : Number(job.fitRanking);
            const validScore = Number.isFinite(score) ? score : 0;
            if (validScore > highestScore) {
              highestScore = validScore;
              highestJob = job;
            }
          }
        }

        if (highestJob) {
          topFitScore = Math.max(0, highestScore);
          const title =
            typeof highestJob.title === 'string' ? highestJob.title.trim() : null;
          topJobTitle = title || null;
        }
      }

      return {
        id: item.id,
        createdAt: item.createdAt,
        jobCount: jobs.length,
        numberOfJobs: jobs.length,
        topFitScore,
        topFit: topFitScore,
        topJobTitle,
      };
    });
  }

  async getOne(id: string, userId: string) {
    const result = await this.prisma.jobTarget.findFirst({
      where: { id, userId },
    });

    if (!result) {
      throw new NotFoundException('Job market analysis not found');
    }

    return result;
  }
}
