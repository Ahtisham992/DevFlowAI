import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.note.create({
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
  }

  async update(id: string, userId: string, dto: UpdateNoteDto) {
    const existing = await this.findOne(id, userId);

    const newTitle = dto.title ?? existing.title;
    const newContent =
      dto.content !== undefined ? dto.content : existing.content;

    return this.prisma.note.update({
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
