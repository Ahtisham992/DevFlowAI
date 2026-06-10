import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string, search?: string, tag?: string, projectId?: string) {
        return this.prisma.note.findMany({
            where: {
                userId,
                ...(projectId && { projectId }),
                ...(tag && { tags: { has: tag } }),
                ...(search && {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { content: { contains: search, mode: 'insensitive' } },
                    ],
                }),
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
            data: { ...dto, userId },
        });
    }

    async update(id: string, userId: string, dto: UpdateNoteDto) {
        await this.findOne(id, userId);
        return this.prisma.note.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string, userId: string) {
        await this.findOne(id, userId);
        return this.prisma.note.delete({ where: { id } });
    }
}