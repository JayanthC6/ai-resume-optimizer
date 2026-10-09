import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ResumeModule } from './resume/resume.module';
import { AiModule } from './ai/ai.module';
import { AnalysisModule } from './analysis/analysis.module';
import { InterviewModule } from './interview/interview.module';
import { JobMarketModule } from './job-market/job-market.module';
import { OutreachModule } from './outreach/outreach.module';
import { RedisModule } from './redis/redis.module';
import { PlanTrackerModule } from './plan-tracker/plan-tracker.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../../.env' }),
    PrismaModule,
    AuthModule,
    ResumeModule,
    AiModule,
    AnalysisModule,
    InterviewModule,
    JobMarketModule,
    OutreachModule,
    RedisModule,
    PlanTrackerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
