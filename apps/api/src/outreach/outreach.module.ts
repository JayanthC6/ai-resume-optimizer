import { Module } from '@nestjs/common';
import { OutreachService } from './outreach.service';
import { OutreachController } from './outreach.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, AiModule, RedisModule],
  controllers: [OutreachController],
  providers: [OutreachService],
})
export class OutreachModule {}
