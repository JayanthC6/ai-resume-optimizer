import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { OptimizationRequest, ResumeRegenerationRequest } from '@repo/types';

@Injectable()
export class AnalysisService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService
  ) { }

  async runAnalysis(userId: string, dto: OptimizationRequest) {
    // 1. Fetch the raw resume
    const resume = await this.prisma.resume.findFirst({
      where: { id: dto.resumeId, userId }
    });

    if (!resume || !resume.rawText) {
      throw new NotFoundException('Resume not found or not parsed');
    }

    // 2. Create pending Analysis record
    const analysis = await this.prisma.analysis.create({
      data: {
        resumeId: resume.id,
        jobTitle: dto.jobTitle,
        companyName: dto.companyName,
        jobDescription: dto.jobDescription,
        status: 'processing'
      }
    });

    // 3. Process AI (in production this should be a BullMQ background job)
    // Running inline for V1 Alpha MVP
    try {
      const aiResult = await this.aiService.optimizeResume(
        resume.rawText,
        dto.jobDescription
      );

      return this.prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'completed',
          matchScore: aiResult.matchScore,
          atsScore: aiResult.atsScore,
          gapAnalysis: aiResult.gapAnalysis,
          keywordAnalysis: aiResult.keywordAnalysis,
          rewrites: aiResult.rewrites
        }
      });
    } catch (e) {
      this.prisma.analysis.update({
        where: { id: analysis.id },
        data: { status: 'failed' }
      }).catch(err => console.error(err));

      throw new Error('Analysis Engine Pipeline Failed');
    }
  }

  async getAnalysis(userId: string, analysisId: string) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { resume: true }
    });

    if (!analysis || analysis.resume.userId !== userId) {
      throw new NotFoundException('Analysis not found');
    }

    return analysis;
  }

  async regenerateResume(userId: string, dto: ResumeRegenerationRequest) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: dto.resumeId, userId },
    });

    if (!resume || !resume.rawText) {
      throw new NotFoundException('Resume not found or not parsed');
    }

    return this.aiService.regenerateResume(
      resume.rawText,
      dto.jobTitle,
      dto.jobDescription,
    );
  }
}