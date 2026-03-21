import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { OptimizationRequest, ResumeRegenerationRequest } from '@repo/types';

@Injectable()
export class AnalysisService {
  private readonly creditConfig = {
    free: 25,
    pro: 250,
  } as const;

  constructor(
    private prisma: PrismaService,
    private aiService: AiService
  ) { }

  private mapAnalysisOutput(analysis: any) {
    const rewrites = (analysis.rewrites ?? {}) as any;
    return {
      ...analysis,
      analysisId: analysis.id,
      rewrites: {
        summary: rewrites.summary ?? '',
        experienceText: rewrites.experienceText ?? '',
        actionVerbUpgrades: rewrites.actionVerbUpgrades ?? [],
        measurableImpactSuggestions: rewrites.measurableImpactSuggestions ?? [],
        toolTechAdditions: rewrites.toolTechAdditions ?? [],
        weakAdjectivesToRemove: rewrites.weakAdjectivesToRemove ?? [],
      },
      skillGapRoadmap: rewrites.skillGapRoadmap,
      interviewQuestionSet: rewrites.interviewQuestionSet,
      recruiterView: rewrites.recruiterView,
      creditUsage: rewrites.creditUsage,
    };
  }

  private async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async getCreditUsage(userId: string) {
    const user = await this.getUserById(userId);
    const plan = user.subscription === 'pro' ? 'pro' : 'free';
    const totalCredits = this.creditConfig[plan];

    const usedCredits = await this.prisma.analysis.count({
      where: {
        resume: { userId },
        status: 'completed',
      },
    });

    return {
      plan,
      totalCredits,
      usedCredits,
      remainingCredits: Math.max(totalCredits - usedCredits, 0),
    };
  }

  private async assertCredits(userId: string, requiredCredits = 1) {
    const creditUsage = await this.getCreditUsage(userId);
    if (creditUsage.remainingCredits < requiredCredits) {
      throw new ForbiddenException('No credits remaining. Upgrade plan or purchase credits.');
    }
  }

  private async getResumeRawText(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume || !resume.rawText) {
      throw new NotFoundException('Resume not found or not parsed');
    }

    return resume.rawText;
  }

  private parseGithubUsername(profileInput: string) {
    const normalizedInput = (profileInput ?? '').trim();
    if (!normalizedInput) {
      throw new BadRequestException('GitHub profile URL is required');
    }

    const usernamePattern = /^(?!-)(?!.*--)[A-Za-z0-9-]{1,39}(?<!-)$/;
    if (usernamePattern.test(normalizedInput)) {
      return normalizedInput;
    }

    let parsed: URL;
    try {
      const withScheme = /^https?:\/\//i.test(normalizedInput)
        ? normalizedInput
        : `https://${normalizedInput}`;
      parsed = new URL(withScheme);
    } catch {
      throw new BadRequestException('Invalid GitHub profile URL');
    }

    const host = parsed.hostname.toLowerCase();
    if (host !== 'github.com' && host !== 'www.github.com') {
      throw new BadRequestException('Only github.com profile URLs are supported');
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    const username = segments[0] ?? '';
    if (!usernamePattern.test(username)) {
      throw new BadRequestException('Invalid GitHub username in profile URL');
    }

    return username;
  }

  async runAnalysis(userId: string, dto: OptimizationRequest) {
    await this.assertCredits(userId, 1);

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

      const [skillGapRoadmap, interviewQuestionSet, recruiterView, creditUsage] = await Promise.all([
        this.aiService.generateSkillGapRoadmap(resume.rawText, dto.jobTitle, dto.jobDescription),
        this.aiService.generateInterviewQuestions(resume.rawText, dto.jobTitle, dto.jobDescription),
        this.aiService.generateRecruiterView(resume.rawText, dto.jobTitle, dto.jobDescription),
        this.getCreditUsage(userId),
      ]);

      const updated = await this.prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'completed',
          matchScore: aiResult.matchScore,
          atsScore: aiResult.atsScore,
          gapAnalysis: aiResult.gapAnalysis,
          keywordAnalysis: aiResult.keywordAnalysis,
          rewrites: {
            ...aiResult.rewrites,
            skillGapRoadmap,
            interviewQuestionSet,
            recruiterView,
            creditUsage,
          },
        },
      });

      return this.mapAnalysisOutput(updated);
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

    return this.mapAnalysisOutput(analysis);
  }

  async getCreditSnapshot(userId: string) {
    return this.getCreditUsage(userId);
  }

  async generateSkillGapRoadmap(userId: string, dto: OptimizationRequest) {
    await this.assertCredits(userId, 1);
    const rawText = await this.getResumeRawText(userId, dto.resumeId);
    return this.aiService.generateSkillGapRoadmap(rawText, dto.jobTitle, dto.jobDescription);
  }

  async generateInterviewQuestions(userId: string, dto: OptimizationRequest) {
    await this.assertCredits(userId, 1);
    const rawText = await this.getResumeRawText(userId, dto.resumeId);
    return this.aiService.generateInterviewQuestions(rawText, dto.jobTitle, dto.jobDescription);
  }

  async generateRecruiterView(userId: string, dto: OptimizationRequest) {
    await this.assertCredits(userId, 1);
    const rawText = await this.getResumeRawText(userId, dto.resumeId);
    return this.aiService.generateRecruiterView(rawText, dto.jobTitle, dto.jobDescription);
  }

  async analyzeGithubPortfolio(
    userId: string,
    dto: OptimizationRequest,
    githubProfileUrl: string,
  ) {
    await this.assertCredits(userId, 1);
    const rawText = await this.getResumeRawText(userId, dto.resumeId);
    const githubUsername = this.parseGithubUsername(githubProfileUrl);
    const githubHeaders = { 'User-Agent': 'ai-resume-optimizer' };
    const profileUrl = `https://api.github.com/users/${githubUsername}`;
    const reposUrl = `https://api.github.com/users/${githubUsername}/repos?type=owner&sort=updated&per_page=12`;

    const [profileRes, reposRes] = await Promise.all([
      fetch(profileUrl, { headers: githubHeaders }),
      fetch(reposUrl, { headers: githubHeaders }),
    ]);

    if (!profileRes.ok) {
      throw new NotFoundException('Could not fetch GitHub profile');
    }

    if (!reposRes.ok) {
      throw new NotFoundException('Could not fetch GitHub repositories');
    }

    const profileJson = await profileRes.json() as any;
    const reposJson = await reposRes.json() as any[];
    const ownedRepos = Array.isArray(reposJson) ? reposJson : [];

    const topRepos = [...ownedRepos]
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 8);

    const languageBreakdown = topRepos.reduce<Record<string, number>>((acc, repo: any) => {
      const lang = repo?.language;
      if (lang) {
        acc[lang] = (acc[lang] ?? 0) + 1;
      }
      return acc;
    }, {});

    const totalStars = topRepos.reduce((sum, repo: any) => sum + (repo?.stargazers_count ?? 0), 0);
    const totalForks = topRepos.reduce((sum, repo: any) => sum + (repo?.forks_count ?? 0), 0);

    const commitResponses = await Promise.all(
      topRepos.slice(0, 4).map((repo: any) =>
        fetch(`https://api.github.com/repos/${githubUsername}/${repo.name}/commits?per_page=3`, {
          headers: githubHeaders,
        }),
      ),
    );

    const commitHighlights: Array<{ repo: string; recentCommits: string[] }> = [];
    for (let i = 0; i < commitResponses.length; i += 1) {
      const response = commitResponses[i];
      const repo = topRepos[i];
      if (!response.ok || !repo?.name) {
        continue;
      }
      const commits = await response.json() as any[];
      commitHighlights.push({
        repo: repo.name,
        recentCommits: commits.slice(0, 3).map((c: any) => c?.commit?.message).filter(Boolean),
      });
    }

    const githubContext = JSON.stringify({
      profile: {
        username: profileJson.login,
        name: profileJson.name,
        bio: profileJson.bio,
        company: profileJson.company,
        location: profileJson.location,
        blog: profileJson.blog,
        followers: profileJson.followers,
        following: profileJson.following,
        publicRepos: profileJson.public_repos,
      },
      accountSummary: {
        analyzedRepos: topRepos.length,
        totalStars,
        totalForks,
        languageBreakdown,
      },
      topRepositories: topRepos.map((repo: any) => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        topics: repo.topics,
        updatedAt: repo.updated_at,
      })),
      recentCommitHighlights: commitHighlights,
    });

    return this.aiService.analyzeGithubPortfolio(rawText, dto.jobTitle, dto.jobDescription, githubContext);
  }

  getTemplates() {
    return [
      {
        id: 'classic-ats',
        name: 'Classic ATS',
        description: 'Traditional ATS-safe format with clear hierarchy and concise sections.',
        atsSafe: true,
        tone: 'classic',
      },
      {
        id: 'modern-tech',
        name: 'Modern Tech',
        description: 'Balanced modern layout optimized for engineering and product resumes.',
        atsSafe: true,
        tone: 'modern',
      },
      {
        id: 'compact-impact',
        name: 'Compact Impact',
        description: 'High-density one-page format designed to maximize signal in short scans.',
        atsSafe: true,
        tone: 'compact',
      },
    ];
  }

  async getTeamAnalytics(userId: string, teamName = 'Career Cohort') {
    const analyses = await this.prisma.analysis.findMany({
      where: {
        resume: { userId },
        status: 'completed',
      },
      select: {
        matchScore: true,
        atsScore: true,
      },
    });

    const avg = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
    const matchScores = analyses.map((a) => Number(a.matchScore ?? 0));
    const atsScores = analyses.map((a) => Number(a.atsScore ?? 0));

    return {
      teamName,
      members: 1,
      avgMatchScore: Number(avg(matchScores).toFixed(2)),
      avgAtsScore: Number(avg(atsScores).toFixed(2)),
      highPerformers: analyses.filter((a) => Number(a.matchScore ?? 0) >= 80).length,
    };
  }

  async regenerateResume(userId: string, dto: ResumeRegenerationRequest) {
    await this.assertCredits(userId, 1);

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