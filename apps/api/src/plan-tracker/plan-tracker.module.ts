import { Module } from '@nestjs/common';
import { PlanTrackerService } from './plan-tracker.service';
import { PlanTrackerController } from './plan-tracker.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PlanReminderService } from './plan-reminder.service';
import { PlanReminderWorker } from './plan-reminder.worker';

@Module({
  imports: [PrismaModule],
  controllers: [PlanTrackerController],
  providers: [PlanTrackerService, PlanReminderService, PlanReminderWorker],
  exports: [PlanTrackerService, PlanReminderService],
})
export class PlanTrackerModule {}
