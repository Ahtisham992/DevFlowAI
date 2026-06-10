'use client';

import { useAuthStore } from '@/store/auth.store';

export default function DashboardPage() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    Welcome back, {user?.name ?? user?.email} 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                    Your AI-powered developer workspace
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Workspaces', value: '0', icon: '📁' },
                    { label: 'Notes', value: '0', icon: '📝' },
                    { label: 'AI Chats', value: '0', icon: '🤖' },
                ].map((stat) => (
                    <div key={stat.label} className="border rounded-xl p-4 space-y-1">
                        <div className="text-2xl">{stat.icon}</div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="border rounded-xl p-6 text-center text-muted-foreground">
                <p className="text-lg">🚧 More features coming soon...</p>
                <p className="text-sm mt-1">Workspaces, Notes and AI Chat are on the way!</p>
            </div>
        </div>
    );
}