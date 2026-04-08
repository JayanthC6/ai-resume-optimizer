import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Param, 
  Req 
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { 
  InterviewStartRequest, 
  InterviewChatRequest 
} from '@repo/types';

class InterviewStartDto implements InterviewStartRequest {
  resumeId!: string;
  jobTitle!: string;
  jobDescription!: string;
  mode!: 'Behavioral' | 'Technical' | 'Mixed';
  language?: string;
}

class InterviewChatDto implements InterviewChatRequest {
  sessionId!: string;
  message!: string;
}

class CodingEvaluationDto {
  question!: string;
  code!: string;
  language!: string;
}

@Controller('analysis/interview-bot')
@UseGuards(JwtAuthGuard)
export class InterviewController {
  constructor(private interviewService: InterviewService) {}

  @Post('start')
  start(@Req() req: any, @Body() data: InterviewStartDto) {
    return this.interviewService.startSession(req.user.id, data);
  }

  @Post('chat')
  chat(@Req() req: any, @Body() data: InterviewChatDto) {
    return this.interviewService.chat(req.user.id, data);
  }

  @Post('recommend-duration')
  recommendDuration(@Req() req: any, @Body() data: InterviewStartDto) {
    return this.interviewService.recommendDuration(req.user.id, data);
  }

  @Post('coding/:id/questions')
  codingQuestions(@Req() req: any, @Param('id') id: string) {
    return this.interviewService.generateCodingPractice(req.user.id, id);
  }

  @Post('coding/:id/evaluate')
  evaluateCoding(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: CodingEvaluationDto,
  ) {
    return this.interviewService.evaluateCodingPractice(
      req.user.id,
      id,
      data.question,
      data.code,
      data.language,
    );
  }

  @Post('end/:id')
  end(@Req() req: any, @Param('id') id: string) {
    return this.interviewService.endSession(req.user.id, id);
  }

  @Get('history')
  history(@Req() req: any) {
    return this.interviewService.getHistory(req.user.id);
  }

  @Get(':id')
  getSession(@Req() req: any, @Param('id') id: string) {
    return this.interviewService.getSession(req.user.id, id);
  }
}
