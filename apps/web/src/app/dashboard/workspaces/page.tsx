'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import api from '@/lib/axios';

interface Workspace {
    id: string;
    name: string;
    description?: string;
    _count: { projects: number };
    createdAt: string;
}

export default function WorkspacesPage() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const { data: workspaces = [], isLoading } = useQuery({
        queryKey: ['workspaces'],
        queryFn: async () => {
            const { data } = await api.get<Workspace[]>('/workspaces');
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/workspaces', { name, description });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            setShowModal(false);
            setName('');
            setDescription('');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/workspaces/${id}`);
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['workspaces'] });
            const previous = queryClient.getQueryData(['workspaces']);
            queryClient.setQueryData(['workspaces'], (old: Workspace[]) =>
                old.filter((w) => w.id !== id),
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            queryClient.setQueryData(['workspaces'], context?.previous);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Workspaces</h1>
                    <p className="text-muted-foreground text-sm">
                        Organize your projects into workspaces
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition"
                >
                    <Plus className="w-4 h-4" />
                    New Workspace
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-xl p-4 h-32 animate-pulse bg-muted" />
                    ))}
                </div>
            ) : workspaces.length === 0 ? (
                <div className="border rounded-xl p-12 text-center text-muted-foreground">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No workspaces yet</p>
                    <p className="text-sm mt-1">Create your first workspace to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {workspaces.map((ws) => (
                        <div key={ws.id} className="border rounded-xl p-4 space-y-3 hover:shadow-sm transition">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <FolderOpen className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">{ws.name}</h3>
                                </div>
                                <button
                                    onClick={() => deleteMutation.mutate(ws.id)}
                                    className="text-muted-foreground hover:text-red-500 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {ws.description && (
                                <p className="text-sm text-muted-foreground">{ws.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {ws._count.projects} projects
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background border rounded-xl p-6 w-full max-w-md space-y-4">
                        <h2 className="text-lg font-bold">New Workspace</h2>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My Workspace"
                                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (optional)</label>
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this workspace for?"
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
                                disabled={!name || createMutation.isPending}
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