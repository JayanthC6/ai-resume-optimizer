import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { OutreachService } from './outreach.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GenerateOutreachDto, UpdateOutreachDto } from './dto/outreach.dto';

@Controller('outreach')
@UseGuards(JwtAuthGuard)
export class OutreachController {
  constructor(private readonly outreachService: OutreachService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateOutreachDto, @Request() req: any) {
    return this.outreachService.generate(req.user.id, dto);
  }

  @Get()
  async list(@Query('analysisId') analysisId: string, @Request() req: any) {
    return this.outreachService.list(req.user.id, analysisId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOutreachDto,
    @Request() req: any
  ) {
    return this.outreachService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.outreachService.delete(req.user.id, id);
  }
}
