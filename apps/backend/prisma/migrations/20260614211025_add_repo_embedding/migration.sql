-- CreateTable
CREATE TABLE "RepoEmbedding" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(768),
    "projectId" TEXT NOT NULL,

    CONSTRAINT "RepoEmbedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RepoEmbedding" ADD CONSTRAINT "RepoEmbedding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
