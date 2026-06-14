'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitBranch as Github, Link as LinkIcon, Loader2, Star, GitFork, GitBranch, FileCode2, FolderTree } from 'lucide-react';
import api from '@/lib/axios';

interface GithubRepoViewProps {
    projectId: string;
    initialGithubUrl?: string;
}

interface RepoMetadata {
    name: string;
    fullName: string;
    description: string;
    stargazersCount: number;
    forksCount: number;
    language: string;
    defaultBranch: string;
}

interface TreeNode {
    path: string;
    type: 'blob' | 'tree';
    sha: string;
    url: string;
}

interface RepoDetailsResponse {
    metadata: RepoMetadata;
    tree: TreeNode[];
}

export function GithubRepoView({ projectId, initialGithubUrl }: GithubRepoViewProps) {
    const queryClient = useQueryClient();
    const [repoUrl, setRepoUrl] = useState('');

    const { data: repoDetails, isLoading: isLoadingDetails, error: detailsError } = useQuery({
        queryKey: ['github-repo', projectId],
        queryFn: async () => {
            const { data } = await api.get<RepoDetailsResponse>(`/github/repo/${projectId}`);
            return data;
        },
        enabled: !!initialGithubUrl,
    });

    const connectMutation = useMutation({
        mutationFn: async (url: string) => {
            const { data } = await api.post('/github/connect', { projectId, repoUrl: url });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['github-repo', projectId] });
        },
    });

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        if (!repoUrl) return;
        connectMutation.mutate(repoUrl);
    };

    if (!initialGithubUrl) {
        return (
            <div className="border rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full text-primary">
                    <Github className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Connect GitHub Repository</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                        Connect a public GitHub repository to index its code into DevFlow AI for semantic search and Q&A.
                    </p>
                </div>
                <form onSubmit={handleConnect} className="flex gap-2 w-full max-w-md mt-4">
                    <input
                        type="url"
                        placeholder="https://github.com/owner/repo"
                        className="flex-1 px-4 py-2 rounded-lg border bg-background"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={connectMutation.isPending}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition flex items-center gap-2"
                    >
                        {connectMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <LinkIcon className="w-4 h-4" />
                        )}
                        Connect
                    </button>
                </form>
                {connectMutation.isError && (
                    <p className="text-red-500 text-sm mt-2">
                        Failed to connect. Make sure it's a valid public repository.
                    </p>
                )}
            </div>
        );
    }

    if (isLoadingDetails) {
        return (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (detailsError || !repoDetails) {
        return (
            <div className="border rounded-xl p-8 text-center text-red-500">
                Failed to load repository details.
            </div>
        );
    }

    const { metadata, tree } = repoDetails;

    // A very simple file tree rendering - only showing root and first-level files to avoid huge lists
    const rootFiles = tree.filter((t) => !t.path.includes('/'));

    return (
        <div className="space-y-6">
            <div className="border rounded-xl p-6 bg-card text-card-foreground">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Github className="w-5 h-5" />
                            {metadata.fullName}
                        </h3>
                        <p className="text-muted-foreground mt-1">{metadata.description}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 mt-6 text-sm">
                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{metadata.stargazersCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <GitFork className="w-4 h-4" />
                        <span>{metadata.forksCount}</span>
                    </div>
                    {metadata.language && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <FileCode2 className="w-4 h-4" />
                            <span>{metadata.language}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <GitBranch className="w-4 h-4" />
                        <span>{metadata.defaultBranch}</span>
                    </div>
                </div>
            </div>

            <div className="border rounded-xl overflow-hidden bg-card text-card-foreground">
                <div className="bg-muted px-4 py-3 border-b flex items-center gap-2 font-medium">
                    <FolderTree className="w-4 h-4" />
                    Repository Files
                </div>
                <div className="p-2 max-h-[400px] overflow-y-auto">
                    {rootFiles.map((node) => (
                        <div
                            key={node.path}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 rounded-md transition"
                        >
                            {node.type === 'tree' ? (
                                <FolderTree className="w-4 h-4 text-blue-500" />
                            ) : (
                                <FileCode2 className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className={node.type === 'tree' ? 'font-medium' : ''}>
                                {node.path}
                            </span>
                        </div>
                    ))}
                    {tree.length > rootFiles.length && (
                        <div className="px-3 py-2 text-sm text-muted-foreground italic">
                            + {tree.length - rootFiles.length} more files in subdirectories
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
