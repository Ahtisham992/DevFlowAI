import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';

import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
