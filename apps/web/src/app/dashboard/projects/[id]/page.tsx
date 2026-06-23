'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderGit2, FileText, Bot, GitBranch, Activity } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { GithubRepoView } from '@/components/projects/GithubRepoView';
import { ChatInterface } from '@/components/chat/ChatInterface';

interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    githubUrl?: string;
    notes: { id: string; title: string; updatedAt: string }[];
}

const tabs = [
    { label: 'Overview', icon: FolderGit2 },
    { label: 'Notes', icon: FileText },
    { label: 'Code', icon: GitBranch },
    { label: 'AI Chat', icon: Bot },
];

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState('Overview');

    const { data: project, isLoading, error } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            if (!id || id === 'undefined') return null;
            const { data } = await api.get<Project>(`/projects/${id}`);
            return data;
        },
        enabled: !!id && id !== 'undefined',
    });

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-muted rounded w-48" />
                <div className="h-4 bg-muted rounded w-96" />
                <div className="h-32 bg-muted rounded" />
            </div>
        );
    }

    if (error) {
        return <div className="p-12 text-center text-red-500">Error loading project. It may have been deleted or you don't have access.</div>;
    }

    if (!project) return <div className="p-12 text-center">Project not found</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <FolderGit2 className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted capitalize">
                            {project.status}
                        </span>
                    </div>
                    {project.description && (
                        <p className="text-muted-foreground text-sm">{project.description}</p>
                    )}
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            <GitBranch className="w-3 h-3" />
                            {project.githubUrl}
                        </a>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b flex gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.label}
                            onClick={() => setActiveTab(tab.label)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition -mb-px whitespace-nowrap',
                                activeTab === tab.label
                                    ? 'border-primary text-primary font-medium'
                                    : 'border-transparent text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'Overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Notes', value: project.notes.length, icon: FileText },
                        { label: 'Status', value: project.status, icon: Activity },
                        { label: 'GitHub', value: project.githubUrl ? 'Connected' : 'Not connected', icon: GitBranch },
                    ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="border rounded-xl p-4 space-y-2">
                                <div className="text-primary bg-primary/10 w-fit p-2 rounded-lg">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold capitalize">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'Notes' && (
                <ProjectNotesTab projectId={project.id} initialNotes={project.notes} />
            )}

            {activeTab === 'Code' && (
                <GithubRepoView projectId={project.id} initialGithubUrl={project.githubUrl} />
            )}

            {activeTab === 'AI Chat' && (
                <ChatInterface projectId={project.id} />
            )}
        </div>
    );
}

function ProjectNotesTab({ projectId, initialNotes }: { projectId: string; initialNotes: any[] }) {
    const queryClient = useQueryClient();
    const router = import('next/navigation').then(m => m.useRouter);
    // Note: Because router is tricky inside nested component in same file, we can just use window.location
    const [title, setTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!title) return;
        setIsCreating(true);
        try {
            const { data } = await api.post('/notes', { title, content: '', tags: [], projectId });
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            window.location.href = `/dashboard/notes/${data.id}`;
        } catch (e) {
            console.error(e);
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="New Note Title..."
                    className="flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <button
                    onClick={handleCreate}
                    disabled={!title || isCreating}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                >
                    {isCreating ? 'Creating...' : 'Create Note'}
                </button>
            </div>

            <div className="space-y-3">
                {initialNotes.length === 0 ? (
                    <div className="border rounded-xl p-12 text-center text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No notes yet</p>
                        <p className="text-sm mt-1">Notes for this project will appear here</p>
                    </div>
                ) : (
                    initialNotes.map((note) => (
                        <div 
                            key={note.id} 
                            onClick={() => window.location.href = `/dashboard/notes/${note.id}`}
                            className="border rounded-xl p-4 hover:shadow-sm transition cursor-pointer flex justify-between items-center"
                        >
                            <p className="font-medium">{note.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}