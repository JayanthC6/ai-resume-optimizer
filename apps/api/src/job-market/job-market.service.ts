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
      const scores = jobs.map((j) =>
        typeof j?.fitRanking === 'number' ? j.fitRanking : Number(j?.fitRanking) || 0,
      );
      const topFitScore = scores.length > 0 ? Math.max(...scores) : 0;

      return {
        id: item.id,
        createdAt: item.createdAt,
        jobCount: jobs.length,
        numberOfJobs: jobs.length,
        topFitScore,
        topFit: topFitScore,
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
