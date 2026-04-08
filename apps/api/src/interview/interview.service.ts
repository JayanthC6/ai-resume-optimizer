import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { 
  InterviewStartRequest, 
  InterviewChatRequest, 
} from '@repo/types';

@Injectable()
export class InterviewService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async startSession(userId: string, data: InterviewStartRequest) {
    // Create the session
    const session = await this.prisma.interviewSession.create({
      data: {
        userId,
        resumeId: data.resumeId,
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        mode: data.mode,
        language: data.language,
        status: 'active',
      },
    });

    // Get resume text
    const resume = await this.prisma.resume.findUnique({ where: { id: data.resumeId } });
    if (!resume) throw new NotFoundException('Resume not found');

    // Generate first question
    const firstQuestion = await this.aiService.generateInterviewResponse(
      [],
      resume.rawText || '',
      data.jobDescription,
      data.jobTitle,
      data.mode,
      data.language || undefined,
    );

    // Save assistant message
    const message = await this.prisma.interviewMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: firstQuestion,
      },
    });

    return { session, message };
  }

  async recommendDuration(userId: string, data: InterviewStartRequest) {
    const resume = await this.prisma.resume.findUnique({ where: { id: data.resumeId } });
    if (!resume) throw new NotFoundException('Resume not found');

    const ownerCheck = await this.prisma.resume.findFirst({
      where: { id: data.resumeId, userId },
      select: { id: true },
    });
    if (!ownerCheck) throw new NotFoundException('Resume not found');

    return this.aiService.recommendInterviewDuration(
      resume.rawText || '',
      data.jobDescription,
      data.jobTitle,
      data.mode,
    );
  }

  async chat(userId: string, data: InterviewChatRequest) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: data.sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    // Save user message
    await this.prisma.interviewMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: data.message,
      },
    });

    const resume = await this.prisma.resume.findUnique({ where: { id: session.resumeId } });
    
    // Updated history for AI
    const history = [
      ...session.messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: data.message }
    ];

    const nextQuestion = await this.aiService.generateInterviewResponse(
      history,
      resume?.rawText || '',
      session.jobDescription,
      session.jobTitle,
      session.mode,
      session.language || undefined,
    );

    const assistantMessage = await this.prisma.interviewMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: nextQuestion,
      },
    });

    return { sessionId: session.id, message: assistantMessage, status: 'active' };
  }

  async endSession(userId: string, sessionId: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    const resume = await this.prisma.resume.findUnique({ where: { id: session.resumeId } });

    const evaluation = await this.aiService.evaluateInterview(
      session.messages.map(m => ({ role: m.role, content: m.content })),
      resume?.rawText || '',
      session.jobDescription,
      session.jobTitle,
    );

    const updatedSession = await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        overallScore: evaluation.overall_score,
        technicalScore: evaluation.technical_score,
        communicationScore: evaluation.communication_score,
        report: evaluation,
      },
    });

    return updatedSession;
  }

  async getHistory(userId: string) {
    return this.prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async generateCodingPractice(userId: string, sessionId: string) {
    const session = await this.prisma.interviewSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    const resume = await this.prisma.resume.findUnique({ where: { id: session.resumeId } });

    return this.aiService.generateCodingPracticeQuestions(
      resume?.rawText || '',
      session.jobDescription,
      session.jobTitle,
      session.language || 'JavaScript',
    );
  }

  async evaluateCodingPractice(
    userId: string,
    sessionId: string,
    question: string,
    code: string,
    language: string,
  ) {
    const session = await this.prisma.interviewSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    return this.aiService.evaluateCodingSubmission(question, code, language);
  }
}
