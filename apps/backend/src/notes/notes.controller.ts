import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.notesService.findAll(user.id, search, tag, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.notesService.findOne(id, user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateNoteDto) {
    return this.notesService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.notesService.remove(id, user.id);
  }
}
