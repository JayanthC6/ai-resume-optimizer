import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';

export function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

@Injectable()
export class PlanReminderService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PlanReminderService.name);
  private queue: Queue | null = null;
  private redisConnection: Redis | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
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
        this.logger.error(`Plan reminder Redis connection error: ${err.message}`);
      });

      this.queue = new Queue('plan-reminders', {
        connection: this.redisConnection as any,
      });

      this.queue.on('error', (err) => {
        this.logger.error(`Plan reminder queue error: ${err.message}`);
      });

      // Register daily job scheduler with fixed ID so restarts never duplicate schedules (runs at 04:00 UTC)
      await this.queue.upsertJobScheduler(
        'daily-plan-reminder-check',
        { pattern: '0 4 * * *' },
        {
          name: 'check-all-reminders',
          data: {},
          opts: {
            removeOnComplete: true,
            removeOnFail: 50,
          },
        },
      );

      this.logger.log('Daily plan reminder scheduler registered (04:00 UTC)');
    } catch (err: any) {
      this.logger.error(
        `Failed to initialize plan reminder queue: ${err.message}`,
      );
    }
  }

  async onModuleDestroy() {
    try {
      if (this.queue) {
        await this.queue.close();
      }
      if (this.redisConnection) {
        await this.redisConnection.quit();
      }
    } catch (err: any) {
      this.logger.warn(`Error during queue shutdown: ${err.message}`);
    }
  }

  getQueue(): Queue | null {
    return this.queue;
  }

  async sendReminderEmail(
    toEmail: string,
    tasks: Array<{ title: string; description: string | null; phase: string }>,
    totalOpenCount: number,
    streak: number,
    completedCount: number,
    totalCount: number,
  ): Promise<{ success: boolean; skipped?: boolean }> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY')?.trim();
    const fromAddress =
      this.configService.get<string>('EMAIL_FROM')?.trim() ||
      'HiredLens <onboarding@resend.dev>';

    const openTasksLabel =
      totalOpenCount <= tasks.length
        ? `${totalOpenCount} open task${totalOpenCount === 1 ? '' : 's'}`
        : `${totalOpenCount} open tasks (showing the next ${tasks.length})`;

    const taskRowsHtml = tasks
      .map((t) => {
        const titleSafe = escapeHtml(t.title);
        const descSafe = t.description ? escapeHtml(t.description) : '';
        const phaseLabel =
          t.phase === 'day30'
            ? 'First 30 Days'
            : t.phase === 'day60'
              ? 'Days 31-60'
              : 'Days 61-90';

        return `
          <li style="margin-bottom: 12px; line-height: 1.5;">
            <strong>[${escapeHtml(phaseLabel)}] ${titleSafe}</strong>
            ${descSafe ? `<br/><span style="color: #64748b; font-size: 13px;">${descSafe}</span>` : ''}
          </li>`;
      })
      .join('');

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">Weekly Roadmap Check-in</h2>
        <p style="font-size: 15px; color: #475569;">
          Here is your weekly progress update on your personalized skill gap roadmap.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Overall Progress:</strong> ${completedCount} / ${totalCount} tasks completed</p>
          <p style="margin: 0; font-size: 14px;"><strong>Current Streak:</strong> 🔥 ${streak} day${streak === 1 ? '' : 's'}</p>
        </div>

        <h3 style="color: #0f172a; margin-bottom: 12px;">Next Open Tasks — ${escapeHtml(openTasksLabel)}</h3>
        <ul style="padding-left: 20px; color: #334155;">
          ${taskRowsHtml}
        </ul>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          <p>You received this because you enabled weekly plan reminders in HiredLens. You can disable this anytime from the Plan Tracker tab.</p>
        </div>
      </div>
    `;

    if (!apiKey) {
      this.logger.log(
        `[MOCK EMAIL - NO RESEND_API_KEY] To: ${toEmail} | ${openTasksLabel} | Streak: ${streak}d | Progress: ${completedCount}/${totalCount}`,
      );
      return { success: true, skipped: true };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: toEmail,
          subject: 'Your Weekly Plan Check-in — HiredLens',
          html: htmlBody,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(
          `Resend API error (${response.status}): ${errText}`,
        );
        return { success: false };
      }

      this.logger.log(`Reminder email sent successfully to ${toEmail}`);
      return { success: true };
    } catch (err: any) {
      this.logger.error(`Failed to send email via Resend: ${err.message}`);
      return { success: false };
    }
  }

  async processUserReminder(
    userId: string,
    isManualTest: boolean = false,
  ): Promise<{ sent: boolean; reason?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        planReminderSetting: true,
      },
    });

    if (!user) {
      return { sent: false, reason: 'User not found' };
    }

    if (!isManualTest && !user.planReminderSetting?.enabled) {
      return { sent: false, reason: 'Reminders disabled' };
    }

    // Cooldown: 6 days (unless it's an explicit manual test)
    if (!isManualTest && user.planReminderSetting?.lastSentAt) {
      const lastSent = new Date(user.planReminderSetting.lastSentAt).getTime();
      const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
      if (lastSent > sixDaysAgo) {
        return { sent: false, reason: 'Within 6-day cooldown' };
      }
    }

    // Fetch open tasks
    const openTasks = await this.prisma.planTask.findMany({
      where: {
        userId,
        status: { in: ['todo', 'in_progress'] },
      },
      orderBy: { sortOrder: 'asc' },
      take: 5,
    });

    if (openTasks.length === 0) {
      return { sent: false, reason: 'No open tasks' };
    }

    // Total tasks for progress
    const allTasks = await this.prisma.planTask.findMany({
      where: { userId },
      select: { status: true },
    });

    const completedCount = allTasks.filter((t) => t.status === 'done').length;
    const totalOpenCount = allTasks.filter((t) => t.status !== 'done').length;

    // Calculate streak
    const completedWithDates = await this.prisma.planTask.findMany({
      where: { userId, status: 'done', completedAt: { not: null } },
      select: { completedAt: true },
    });

    const dates = completedWithDates.map((t) => {
      const d = new Date(t.completedAt!);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });

    const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    const yesterdayTime = todayTime - 86400000;

    let currentDateToCheck =
      uniqueDates[0] === todayTime
        ? todayTime
        : uniqueDates[0] === yesterdayTime
          ? yesterdayTime
          : null;

    if (currentDateToCheck !== null) {
      for (const dt of uniqueDates) {
        if (dt === currentDateToCheck) {
          streak++;
          currentDateToCheck -= 86400000;
        } else if (dt < currentDateToCheck) {
          break;
        }
      }
    }

    const emailResult = await this.sendReminderEmail(
      user.email,
      openTasks,
      totalOpenCount,
      streak,
      completedCount,
      allTasks.length,
    );

    if (emailResult.success) {
      await this.prisma.planReminderSetting.upsert({
        where: { userId },
        update: { lastSentAt: new Date() },
        create: {
          userId,
          enabled: true,
          lastSentAt: new Date(),
        },
      });
      return { sent: true };
    }

    return { sent: false, reason: 'Email delivery failed' };
  }
}
