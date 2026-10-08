import { Module } from '@nestjs/common';
import { JobMarketController } from './job-market.controller';
import { JobMarketService } from './job-market.service';

@Module({
  controllers: [JobMarketController],
  providers: [JobMarketService],
})
export class JobMarketModule {}
