import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

export interface RepoMetadata {
  name: string;
  fullName: string;
  description: string;
  stargazersCount: number;
  forksCount: number;
  language: string;
  defaultBranch: string;
}

@Injectable()
export class GithubService {
  /**
   * Parse a GitHub URL to extract the owner and repo name.
   */
  private parseRepoUrl(repoUrl: string): { owner: string; repo: string } {
    try {
      const url = new URL(repoUrl);
      if (url.hostname !== 'github.com') {
        throw new Error();
      }
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length < 2) {
        throw new Error();
      }
      return { owner: parts[0], repo: parts[1].replace('.git', '') };
    } catch {
      throw new BadRequestException('Invalid GitHub repository URL');
    }
  }

  /**
   * Fetch repository metadata from the GitHub API.
   */
  async fetchRepoMetadata(repoUrl: string): Promise<RepoMetadata> {
    const { owner, repo } = this.parseRepoUrl(repoUrl);

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'DevFlowAI',
          },
        },
      );

      if (response.status === 404) {
        throw new NotFoundException('Repository not found or is not public');
      }

      if (!response.ok) {
        throw new BadRequestException('Failed to fetch repository metadata');
      }

      const data = (await response.json()) as {
        name: string;
        full_name: string;
        description: string;
        stargazers_count: number;
        forks_count: number;
        language: string;
        default_branch: string;
      };

      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        stargazersCount: data.stargazers_count,
        forksCount: data.forks_count,
        language: data.language,
        defaultBranch: data.default_branch,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to connect to GitHub API');
    }
  }
}
