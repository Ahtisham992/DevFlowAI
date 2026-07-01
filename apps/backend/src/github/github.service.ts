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
  private getHeaders(isRaw: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': 'DevFlowAI',
    };
    if (!isRaw) {
      headers['Accept'] = 'application/vnd.github.v3+json';
    }
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
  }
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
        { headers: this.getHeaders() }
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

  /**
   * Fetch the recursive file tree of a repository.
   */
  async fetchRepoTree(repoUrl: string, branch: string): Promise<any[]> {
    const { owner, repo } = this.parseRepoUrl(repoUrl);

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new BadRequestException('Failed to fetch repository tree');
      }

      const data = (await response.json()) as { tree: any[] };
      return data.tree;
    } catch {
      throw new BadRequestException('Failed to fetch repository tree');
    }
  }

  /**
   * Fetch the raw content of a file from a repository.
   */
  async fetchFileContent(
    repoUrl: string,
    filePath: string,
    branch: string,
  ): Promise<string> {
    const { owner, repo } = this.parseRepoUrl(repoUrl);

    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
        { headers: this.getHeaders(true) }
      );

      if (!response.ok) {
        throw new BadRequestException(
          `Failed to fetch file content for ${filePath}`,
        );
      }

      return await response.text();
    } catch {
      throw new BadRequestException(
        `Failed to fetch file content for ${filePath}`,
      );
    }
  }
}
