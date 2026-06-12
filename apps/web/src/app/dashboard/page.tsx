'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { FolderGit2, FileText, Bot } from 'lucide-react';
import api from '@/lib/axios';

export default function DashboardPage() {
    const { user } = useAuthStore();

    const { data: workspaces = [] } = useQuery({
        queryKey: ['workspaces'],
        queryFn: async () => (await api.get('/workspaces')).data,
    });

    const { data: notes = [] } = useQuery({
        queryKey: ['notes'],
        queryFn: async () => (await api.get('/notes')).data,
    });

    const { data: chats = [] } = useQuery({
        queryKey: ['chats'],
        queryFn: async () => (await api.get('/ai/conversations')).data,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    Welcome back, {user?.name ?? user?.email}
                </h1>
                <p className="text-muted-foreground mt-1">
                    Your AI-powered developer workspace
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Workspaces', value: workspaces.length, icon: FolderGit2 },
                    { label: 'Notes', value: notes.length, icon: FileText },
                    { label: 'AI Chats', value: chats.length, icon: Bot },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="border rounded-xl p-4 space-y-2">
                            <div className="text-primary bg-primary/10 w-fit p-2 rounded-lg">
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}