import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Prisma } from '@prisma/client';

import { AiService } from '../ai/ai.service';

@Injectable()
export class NotesService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  private chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.substring(i, i + chunkSize));
      i += chunkSize - overlap;
    }
    return chunks;
  }

  private async indexNote(noteId: string, content: string | null) {
    if (!content) return;

    // Delete old embeddings
    await this.prisma.noteEmbedding.deleteMany({ where: { noteId } });

    const chunks = this.chunkText(content);

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;

      try {
        const { embedding } = await this.aiService.generateEmbeddings(chunk);
        const embeddingString = `[${embedding.join(',')}]`;

        await this.prisma.$executeRaw`
          INSERT INTO "NoteEmbedding" (id, "noteId", content, embedding)
          VALUES (gen_random_uuid(), ${noteId}, ${chunk}, ${embeddingString}::vector)
        `;
      } catch (err) {
        console.error('Failed to index chunk for note', noteId, err);
      }
    }
  }

  async findAll(
    userId: string,
    search?: string,
    tag?: string,
    projectId?: string,
  ) {
    if (search) {
      return this.prisma.$queryRaw`
        SELECT id, title, tags, "projectId", "createdAt", "updatedAt", content,
               ts_rank("searchVector", plainto_tsquery('english', ${search})) as rank
        FROM "Note"
        WHERE "userId" = ${userId}
          AND "searchVector" @@ plainto_tsquery('english', ${search})
          ${projectId ? Prisma.sql`AND "projectId" = ${projectId}` : Prisma.empty}
          ${tag ? Prisma.sql`AND ${tag} = ANY(tags)` : Prisma.empty}
        ORDER BY rank DESC
      `;
    }

    return this.prisma.note.findMany({
      where: {
        userId,
        ...(projectId && { projectId }),
        ...(tag && { tags: { has: tag } }),
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        tags: true,
        projectId: true,
        createdAt: true,
        updatedAt: true,
        content: true,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== userId) throw new ForbiddenException();
    return note;
  }

  async create(userId: string, dto: CreateNoteDto) {
    const note = await this.prisma.note.create({
      data: {
        ...dto,
        userId,
        versions: {
          create: [
            {
              title: dto.title,
              content: dto.content,
            },
          ],
        },
      },
    });

    // Fire and forget indexing
    this.indexNote(note.id, note.content).catch(console.error);

    return note;
  }

  async update(id: string, userId: string, dto: UpdateNoteDto) {
    const existing = await this.findOne(id, userId);

    const newTitle = dto.title ?? existing.title;
    const newContent =
      dto.content !== undefined ? dto.content : existing.content;

    const updatedNote = await this.prisma.note.update({
      where: { id },
      data: {
        ...dto,
        versions: {
          create: [
            {
              title: newTitle,
              content: newContent,
            },
          ],
        },
      },
    });

    if (dto.content !== undefined) {
      this.indexNote(updatedNote.id, updatedNote.content).catch(console.error);
    }

    return updatedNote;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.note.delete({ where: { id } });
  }

  async getVersions(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.noteVersion.findMany({
      where: { noteId: id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
