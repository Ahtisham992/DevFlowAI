import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GithubService } from './github.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';

interface GithubTreeNode {
  path: string;
  type: string;
}

@Processor('repo-indexer')
export class GithubIndexerProcessor extends WorkerHost {
  constructor(
    private readonly githubService: GithubService,
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  // Simple chunking logic similar to NoteService
  private chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.substring(i, i + chunkSize));
      i += chunkSize - overlap;
    }
    return chunks;
  }

  async process(
    job: Job<{ projectId: string; repoUrl: string; branch: string }>,
  ): Promise<any> {
    const { projectId, repoUrl, branch } = job.data;

    console.log(
      `[repo-indexer] Starting indexing for ${repoUrl} (Project ${projectId})`,
    );

    try {
      // 1. Fetch file tree
      const treeAny = await this.githubService.fetchRepoTree(repoUrl, branch);
      const tree = treeAny as GithubTreeNode[];

      // Filter out directories and unwanted files
      const validExtensions = [
        '.ts',
        '.js',
        '.tsx',
        '.jsx',
        '.md',
        '.html',
        '.css',
        '.py',
        '.go',
        '.rs',
      ];
      const files = tree.filter((node) => {
        if (node.type !== 'blob') return false;
        const ext = node.path.substring(node.path.lastIndexOf('.'));
        return validExtensions.includes(ext);
      });

      console.log(`[repo-indexer] Found ${files.length} indexable files`);

      // 2. Fetch content and embed
      for (const file of files) {
        try {
          const content = await this.githubService.fetchFileContent(
            repoUrl,
            file.path,
            branch,
          );
          if (!content.trim()) continue;

          // Clear existing embeddings for this file in this project to prevent duplicates
          await this.prisma.repoEmbedding.deleteMany({
            where: {
              projectId,
              filePath: file.path,
            },
          });

          const chunks = this.chunkText(content);

          for (const chunk of chunks) {
            if (!chunk.trim()) continue;

            // Note: In production we should batch these to prevent overwhelming Ollama
            const { embedding } =
              await this.aiService.generateEmbeddings(chunk);

            const embeddingString = `[${embedding.join(',')}]`;

            await this.prisma.$executeRaw`
              INSERT INTO "RepoEmbedding" ("id", "filePath", "content", "projectId", "embedding")
              VALUES (gen_random_uuid(), ${file.path}, ${chunk}, ${projectId}, ${embeddingString}::vector)
            `;
          }
          console.log(`[repo-indexer] Indexed ${file.path}`);
        } catch (fileError) {
          console.error(
            `[repo-indexer] Failed to index ${file.path}:`,
            fileError,
          );
        }
      }

      console.log(`[repo-indexer] Completed indexing for ${repoUrl}`);
      return { success: true, indexedFiles: files.length };
    } catch (error) {
      console.error(
        `[repo-indexer] Failed to process repository ${repoUrl}:`,
        error,
      );
      throw error;
    }
  }
}
