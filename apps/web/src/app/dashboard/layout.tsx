'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import LoadingScreen from '@/components/loading-screen';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push('/login');
        }
    }, [mounted, isAuthenticated, router]);

    if (!mounted) return <LoadingScreen />;
    if (!isAuthenticated) return <LoadingScreen />;

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r flex flex-col p-4 space-y-2">
                <div className="text-xl font-bold mb-6">DevFlow AI</div>
                <nav className="space-y-1">
                    {[
                        { label: '🏠 Dashboard', href: '/dashboard' },
                        { label: '📁 Workspaces', href: '/dashboard/workspaces' },
                        { label: '📝 Notes', href: '/dashboard/notes' },
                        { label: '🤖 AI Chat', href: '/dashboard/chat' },
                    ].map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="block px-3 py-2 rounded-lg hover:bg-muted text-sm transition"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>
                <div className="mt-auto">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-6">{children}</main>
        </div >
    );
}

function LogoutButton() {
    const { clearAuth } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        document.cookie = 'accessToken=; path=/; max-age=0';
        clearAuth();
        router.push('/login');
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm rounded-lg hover:bg-muted text-left transition"
        >
            🚪 Logout
        </button>
    );
}