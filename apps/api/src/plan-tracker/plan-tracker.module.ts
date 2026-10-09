import { Module } from '@nestjs/common';
import { PlanTrackerService } from './plan-tracker.service';
import { PlanTrackerController } from './plan-tracker.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlanTrackerController],
  providers: [PlanTrackerService],
})
export class PlanTrackerModule {}
