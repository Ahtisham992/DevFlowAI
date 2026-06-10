import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, workspaceId?: string) {
    return this.prisma.project.findMany({
      where: {
        workspace: { userId },
        ...(workspaceId && { workspaceId }),
      },
      include: { _count: { select: { notes: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { workspace: true, notes: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.workspace.userId !== userId) throw new ForbiddenException();
    return project;
  }

  async create(userId: string, dto: CreateProjectDto) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: dto.workspaceId },
    });
    if (!workspace || workspace.userId !== userId) {
      throw new ForbiddenException();
    }
    return this.prisma.project.create({ data: dto });
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    await this.findOne(id, userId);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.project.delete({ where: { id } });
  }
}
