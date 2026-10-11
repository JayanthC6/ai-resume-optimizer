import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PlanTrackerService } from './plan-tracker.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Controller('plan-tracker')
@UseGuards(JwtAuthGuard)
export class PlanTrackerController {
  constructor(private readonly planService: PlanTrackerService) {}

  @Post('sync/:analysisId')
  async syncRoadmapTasks(@Param('analysisId') analysisId: string, @Request() req: any) {
    return this.planService.syncRoadmapTasks(req.user.id, analysisId);
  }

  @Get('streak')
  async getStreak(@Request() req: any) {
    return this.planService.getStreak(req.user.id);
  }

  @Get('reminders')
  async getReminders(@Request() req: any) {
    return this.planService.getReminderSettings(req.user.id);
  }

  @Patch('reminders')
  async updateReminders(@Body() dto: UpdateReminderDto, @Request() req: any) {
    return this.planService.updateReminderSettings(req.user.id, dto.enabled);
  }

  @Post('reminders/test-trigger')
  async testTriggerReminder(@Request() req: any) {
    return this.planService.testTriggerReminder(req.user.id);
  }

  @Get(':analysisId')
  async getTasks(@Param('analysisId') analysisId: string, @Request() req: any) {
    return this.planService.getTasks(req.user.id, analysisId);
  }

  @Patch('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Request() req: any) {
    return this.planService.updateTask(req.user.id, id, dto);
  }
}
