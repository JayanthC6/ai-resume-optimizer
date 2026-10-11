import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { PlanReminderService } from './plan-reminder.service';

@Injectable()
export class PlanReminderWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PlanReminderWorker.name);
  private worker: Worker | null = null;
  private redisConnection: Redis | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private reminderService: PlanReminderService,
  ) {}

  async onModuleInit() {
    try {
      const redisUrl = this.configService.get<string>(
        'REDIS_URL',
        'redis://localhost:16379',
      );

      this.redisConnection = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
      });

      this.redisConnection.on('error', (err) => {
        this.logger.error(`Plan reminder worker Redis error: ${err.message}`);
      });

      this.worker = new Worker(
        'plan-reminders',
        async (job: Job) => {
          this.logger.log(`Processing plan reminders job: ${job.name} (id: ${job.id})`);

          if (job.name === 'check-all-reminders') {
            await this.handleCheckAllReminders();
          } else if (job.name === 'check-user-reminder' && job.data?.userId) {
            await this.reminderService.processUserReminder(
              job.data.userId,
              Boolean(job.data?.isManualTest),
            );
          }
        },
        {
          connection: this.redisConnection as any,
          concurrency: 1,
        },
      );

      this.worker.on('error', (err) => {
        this.logger.error(`BullMQ worker error: ${err.message}`);
      });

      this.worker.on('failed', (job, err) => {
        this.logger.error(`Job ${job?.id} failed: ${err.message}`);
      });

      this.logger.log('Plan reminder worker initialized');
    } catch (err: any) {
      this.logger.error(`Failed to start plan reminder worker: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.worker) {
        await this.worker.close();
      }
      if (this.redisConnection) {
        await this.redisConnection.quit();
      }
    } catch (err: any) {
      this.logger.warn(`Error during worker shutdown: ${err.message}`);
    }
  }

  private async handleCheckAllReminders() {
    const activeSettings = await this.prisma.planReminderSetting.findMany({
      where: { enabled: true },
      select: { userId: true },
    });

    this.logger.log(
      `Evaluating weekly plan reminders for ${activeSettings.length} active users`,
    );

    for (const setting of activeSettings) {
      try {
        await this.reminderService.processUserReminder(setting.userId, false);
      } catch (err: any) {
        this.logger.error(
          `Failed processing reminder for user ${setting.userId}: ${err.message}`,
        );
      }
    }
  }
}
