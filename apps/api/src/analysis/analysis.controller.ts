import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
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

class GithubAnalyzerDto extends RunAnalysisDto {
  githubProfileUrl!: string;
}

@Controller('analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('run')
  async runAnalysis(@Body() dto: RunAnalysisDto, @Request() req: any) {
    return this.analysisService.runAnalysis(req.user.id, dto);
  }

  @Post('regenerate')
  async regenerateResume(
    @Body() dto: RegenerateResumeDto,
    @Request() req: any,
  ) {
    return this.analysisService.regenerateResume(req.user.id, dto);
  }

  @Post('roadmap')
  async generateRoadmap(@Body() dto: RunAnalysisDto, @Request() req: any) {
    return this.analysisService.generateSkillGapRoadmap(req.user.id, dto);
  }

  @Post('interview-questions')
  async generateInterviewQuestions(
    @Body() dto: RunAnalysisDto,
    @Request() req: any,
  ) {
    return this.analysisService.generateInterviewQuestions(req.user.id, dto);
  }

  @Post('recruiter-view')
  async generateRecruiterView(
    @Body() dto: RunAnalysisDto,
    @Request() req: any,
  ) {
    return this.analysisService.generateRecruiterView(req.user.id, dto);
  }

  @Post('github-analyzer')
  async analyzeGithub(@Body() dto: GithubAnalyzerDto, @Request() req: any) {
    return this.analysisService.analyzeGithubPortfolio(
      req.user.id,
      dto,
      dto.githubProfileUrl,
    );
  }

  @Get('templates/list')
  getTemplates() {
    return this.analysisService.getTemplates();
  }

  @Get('team/overview')
  async getTeamOverview(
    @Request() req: any,
    @Query('teamName') teamName?: string,
  ) {
    return this.analysisService.getTeamAnalytics(req.user.id, teamName);
  }

  @Get('credits/usage')
  async getCreditUsage(@Request() req: any) {
    return this.analysisService.getCreditSnapshot(req.user.id);
  }

  @Get(':id')
  async getAnalysis(@Param('id') id: string, @Request() req: any) {
    return this.analysisService.getAnalysis(req.user.id, id);
  }
}
