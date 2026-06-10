'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, FolderGit2, Circle } from 'lucide-react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Workspace {
    id: string;
    name: string;
}

interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    githubUrl?: string;
    workspaceId: string;
    _count: { notes: number };
}

const statusColors: Record<string, string> = {
    active: 'text-green-500',
    paused: 'text-yellow-500',
    completed: 'text-blue-500',
};

export default function ProjectsPage() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [workspaceId, setWorkspaceId] = useState('');

    const router = useRouter();

    const { data: workspaces = [] } = useQuery({
        queryKey: ['workspaces'],
        queryFn: async () => {
            const { data } = await api.get<Workspace[]>('/workspaces');
            return data;
        },
    });

    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const { data } = await api.get<Project[]>('/projects');
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/projects', {
                name,
                description,
                githubUrl,
                workspaceId,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setShowModal(false);
            setName('');
            setDescription('');
            setGithubUrl('');
            setWorkspaceId('');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/projects/${id}`);
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['projects'] });
            const previous = queryClient.getQueryData(['projects']);
            queryClient.setQueryData(['projects'], (old: Project[]) =>
                old.filter((p) => p.id !== id),
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            queryClient.setQueryData(['projects'], context?.previous);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage all your projects
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-xl p-4 h-36 animate-pulse bg-muted" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="border rounded-xl p-12 text-center text-muted-foreground">
                    <FolderGit2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No projects yet</p>
                    <p className="text-sm mt-1">Create your first project to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                            className="border rounded-xl p-4 space-y-3 hover:shadow-sm transition cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <FolderGit2 className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">{project.name}</h3>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteMutation.mutate(project.id);
                                    }}
                                    className="text-muted-foreground hover:text-red-500 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {project.description && (
                                <p className="text-sm text-muted-foreground">
                                    {project.description}
                                </p>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <Circle
                                        className={`w-3 h-3 fill-current ${statusColors[project.status] ?? 'text-gray-400'}`}
                                    />
                                    <span className="text-xs capitalize text-muted-foreground">
                                        {project.status}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {project._count.notes} notes
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background border rounded-xl p-6 w-full max-w-md space-y-4">
                        <h2 className="text-lg font-bold">New Project</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Workspace</label>
                            <select
                                value={workspaceId}
                                onChange={(e) => setWorkspaceId(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select workspace</option>
                                {workspaces.map((ws) => (
                                    <option key={ws.id} value={ws.id}>
                                        {ws.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My Project"
                                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (optional)</label>
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What are you building?"
                                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">GitHub URL (optional)</label>
                            <input
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                placeholder="https://github.com/user/repo"
                                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => createMutation.mutate()}
                                disabled={!name || !workspaceId || createMutation.isPending}
                                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                            >
                                {createMutation.isPending ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}