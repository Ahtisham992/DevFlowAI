import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

import { GithubIndexerProcessor } from './github-indexer.processor';

@Module({
  imports: [
    PrismaModule,
    AiModule,
    BullModule.registerQueue({
      name: 'repo-indexer',
    }),
  ],
  providers: [GithubService, GithubIndexerProcessor],
  controllers: [GithubController],
})
export class GithubModule {}
