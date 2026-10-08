import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { RedisService } from '../redis/redis.service';
import { GenerateOutreachDto, UpdateOutreachDto } from './dto/outreach.dto';

@Injectable()
export class OutreachService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private redisService: RedisService,
  ) {}

  async generate(userId: string, dto: GenerateOutreachDto) {
    // Rate limit: 10 per day per user
    const rlKey = `outreach_limit:${userId}`;
    const current = await this.redisService.get(rlKey);
    if (current && parseInt(current, 10) >= 10) {
      throw new HttpException('Outreach generation limit reached (10/day). Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const analysis = await this.prisma.analysis.findFirst({
      where: { id: dto.analysisId, resume: { userId } },
      include: { resume: true },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    const resumeText = analysis.resume?.rawText;
    if (!resumeText) {
      throw new BadRequestException('Resume text is missing');
    }

    const content = await this.aiService.generateOutreach(
      resumeText,
      analysis.jobDescription,
      dto.type,
      dto.tone,
      dto.length
    );

    const titleMap: Record<string, string> = {
      cover_letter: 'Cover Letter',
      recruiter_message: 'Recruiter Message',
      follow_up_email: 'Follow Up Email',
    };

    const draft = await this.prisma.draft.create({
      data: {
        userId,
        analysisId: analysis.id,
        type: dto.type,
        tone: dto.tone,
        length: dto.length,
        title: `${titleMap[dto.type] || 'Draft'} - ${new Date().toLocaleDateString()}`,
        content,
      },
    });

    // Increment rate limit
    if (current) {
      await this.redisService.getClient().incr(rlKey);
    } else {
      await this.redisService.set(rlKey, '1', 86400); // 24 hours
    }

    return draft;
  }

  async list(userId: string, analysisId?: string) {
    const where: any = { userId };
    if (analysisId) {
      where.analysisId = analysisId;
    }
    return this.prisma.draft.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId: string, id: string, dto: UpdateOutreachDto) {
    const draft = await this.prisma.draft.findFirst({
      where: { id, userId },
    });

    if (!draft) {
      throw new NotFoundException('Draft not found');
    }

    return this.prisma.draft.update({
      where: { id },
      data: dto,
    });
  }

  async delete(userId: string, id: string) {
    const draft = await this.prisma.draft.findFirst({
      where: { id, userId },
    });

    if (!draft) {
      throw new NotFoundException('Draft not found');
    }

    await this.prisma.draft.delete({
      where: { id },
    });

    return { success: true };
  }
}
