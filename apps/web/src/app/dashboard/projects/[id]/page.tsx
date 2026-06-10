'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FolderGit2, FileText, Bot, GitBranch } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

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
    { label: 'AI Chat', icon: Bot },
];

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState('Overview');

    const { data: project, isLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const { data } = await api.get<Project>(`/projects/${id}`);
            return data;
        },
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

    if (!project) return <div>Project not found</div>;

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

      {/* Tabs */ }
    <div className="border-b flex gap-1">
        {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
                <button
                    key={tab.label}
                    onClick={() => setActiveTab(tab.label)}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition -mb-px',
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

    {/* Tab Content */ }
    {
        activeTab === 'Overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Notes', value: project.notes.length, icon: '📝' },
                    { label: 'Status', value: project.status, icon: '🔄' },
                    { label: 'GitHub', value: project.githubUrl ? 'Connected' : 'Not connected', icon: '🐙' },
                ].map((stat) => (
                    <div key={stat.label} className="border rounded-xl p-4 space-y-1">
                        <div className="text-2xl">{stat.icon}</div>
                        <div className="font-bold capitalize">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                ))}
            </div>
        )
    }

    {
        activeTab === 'Notes' && (
            <div className="space-y-3">
                {project.notes.length === 0 ? (
                    <div className="border rounded-xl p-12 text-center text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No notes yet</p>
                        <p className="text-sm mt-1">Notes for this project will appear here</p>
                    </div>
                ) : (
                    project.notes.map((note) => (
                        <div key={note.id} className="border rounded-xl p-4 hover:shadow-sm transition">
                            <p className="font-medium">{note.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))
                )}
            </div>
        )
    }

    {
        activeTab === 'AI Chat' && (
            <div className="border rounded-xl p-12 text-center text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">AI Chat coming soon</p>
                <p className="text-sm mt-1">Chat with AI about this project in Week 4</p>
            </div>
        )
    }
    </div >
  );
}