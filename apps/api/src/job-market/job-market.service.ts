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
}
