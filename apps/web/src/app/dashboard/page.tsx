'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { FolderGit2, FileText, Bot, Plus, Clock, Lightbulb, ChevronRight, MessageSquare } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

const TIPS = [
    "Use 'AI Chat' to quickly generate boilerplate code.",
    "Tag your notes to keep them organized across different workspaces.",
    "Use 'AI Debugger' by pasting both your code and the stack trace for instant fixes.",
    "Create a Workspace to group related Projects together.",
    "Use 'Docs Generator' before committing code to ensure well-documented PRs."
];

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        setTipIndex(Math.floor(Math.random() * TIPS.length));
    }, []);

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

    // Get 3 most recent items by combining notes and workspaces, sorting by createdAt
    const recentActivity = [...notes.map((n: any) => ({ ...n, type: 'note', icon: FileText, href: '/dashboard/notes' })),
                            ...workspaces.map((w: any) => ({ ...w, type: 'workspace', icon: FolderGit2, href: '/dashboard/workspaces' }))]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        Welcome back, {user?.name ?? user?.email}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here's what's happening in your workspace today.
                    </p>
                </div>
                
                {/* Tip of the day */}
                <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl flex items-start gap-3 max-w-sm w-full sm:w-auto">
                    <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Tip: </span> 
                        {TIPS[tipIndex]}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Link href="/dashboard/notes" className="flex items-center gap-2 bg-card border hover:border-primary/50 hover:shadow-sm px-4 py-2.5 rounded-xl transition-all text-sm font-medium">
                        <Plus className="w-4 h-4 text-primary" /> New Note
                    </Link>
                    <Link href="/dashboard/workspaces" className="flex items-center gap-2 bg-card border hover:border-primary/50 hover:shadow-sm px-4 py-2.5 rounded-xl transition-all text-sm font-medium">
                        <FolderGit2 className="w-4 h-4 text-primary" /> New Workspace
                    </Link>
                    <Link href="/dashboard/chat" className="flex items-center gap-2 bg-card border hover:border-primary/50 hover:shadow-sm px-4 py-2.5 rounded-xl transition-all text-sm font-medium">
                        <MessageSquare className="w-4 h-4 text-primary" /> Start AI Chat
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Workspaces', value: workspaces.length, icon: FolderGit2, bg: 'bg-primary/10', color: 'text-primary' },
                        { label: 'Notes', value: notes.length, icon: FileText, bg: 'bg-primary/10', color: 'text-primary' },
                        { label: 'AI Chats', value: chats.length, icon: Bot, bg: 'bg-primary/10', color: 'text-primary' },
                    ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="bg-card border rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[140px]">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">{stat.value}</div>
                                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recent Activity */}
                <div className="bg-card border rounded-2xl p-5 shadow-sm flex flex-col">
                    <h3 className="font-semibold flex items-center gap-2 mb-4 pb-2 border-b">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        Recent Activity
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
                        ) : (
                            recentActivity.map((item: any, idx) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={idx} href={item.href} className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                                {item.title || item.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {item.type}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}