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
