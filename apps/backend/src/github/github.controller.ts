import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GithubService } from './github.service';
import { ConnectRepoDto } from './dto/connect-repo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('github')
@UseGuards(JwtAuthGuard)
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('connect')
  async connectRepo(
    @Request() req: { user: { id: string } },
    @Body() connectRepoDto: ConnectRepoDto,
  ) {
    const userId = req.user.id;
    const { projectId, repoUrl } = connectRepoDto;

    // Verify project belongs to a workspace owned by the user
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.workspace.userId !== userId) {
      throw new ForbiddenException('Access denied to this project');
    }

    // Fetch repository metadata to validate it exists and is public
    const metadata = await this.githubService.fetchRepoMetadata(repoUrl);

    // Update the project with the GitHub URL
    await this.prisma.project.update({
      where: { id: projectId },
      data: { githubUrl: repoUrl },
    });

    return {
      message: 'Repository successfully connected',
      metadata,
    };
  }
}
