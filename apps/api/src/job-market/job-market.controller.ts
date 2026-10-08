import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JobMarketService } from './job-market.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AnalyzeMarketDto } from './dto/analyze-market.dto';

@Controller('job-market')
@UseGuards(JwtAuthGuard)
export class JobMarketController {
  constructor(private readonly jobMarketService: JobMarketService) {}

  @Post('analyze')
  async analyze(@Body() dto: AnalyzeMarketDto, @Request() req: any) {
    return this.jobMarketService.analyzeMarket(req.user.id, dto);
  }
}
