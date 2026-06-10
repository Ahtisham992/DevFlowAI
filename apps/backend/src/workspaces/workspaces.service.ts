import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string) {
        return this.prisma.workspace.findMany({
            where: { userId },
            include: { _count: { select: { projects: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, userId: string) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id },
            include: { projects: true },
        });
        if (!workspace) throw new NotFoundException('Workspace not found');
        if (workspace.userId !== userId) throw new ForbiddenException();
        return workspace;
    }

    async create(userId: string, dto: CreateWorkspaceDto) {
        return this.prisma.workspace.create({
            data: { ...dto, userId },
        });
    }

    async update(id: string, userId: string, dto: UpdateWorkspaceDto) {
        await this.findOne(id, userId);
        return this.prisma.workspace.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string, userId: string) {
        await this.findOne(id, userId);
        return this.prisma.workspace.delete({ where: { id } });
    }
}