import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { OptimizationRequest, ResumeRegenerationRequest } from '@repo/types';

class RunAnalysisDto implements OptimizationRequest {
  resumeId!: string;
  jobTitle!: string;
  companyName?: string;
  jobDescription!: string;
}

class RegenerateResumeDto implements ResumeRegenerationRequest {
  resumeId!: string;
  jobTitle!: string;
  companyName?: string;
  jobDescription!: string;
}

@Controller('analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('run')
  async runAnalysis(@Body() dto: RunAnalysisDto, @Request() req: any) {
    return this.analysisService.runAnalysis(req.user.id, dto);
  }

  @Get(':id')
  async getAnalysis(@Param('id') id: string, @Request() req: any) {
    return this.analysisService.getAnalysis(req.user.id, id);
  }

  @Post('regenerate')
  async regenerateResume(@Body() dto: RegenerateResumeDto, @Request() req: any) {
    return this.analysisService.regenerateResume(req.user.id, dto);
  }
}
