'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/workspaces': 'Workspaces',
    '/dashboard/projects': 'Projects',
    '/dashboard/notes': 'Notes',
    '/dashboard/chat': 'AI Chat',
};

export default function Header() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const title = pageTitles[pathname] ?? 'DevFlow AI';

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
        : user?.email?.[0].toUpperCase() ?? '?';

    return (
        <header className="h-14 border-b flex items-center justify-between px-6">
            <h2 className="font-semibold text-lg">{title}</h2>
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden md:block">
                    {user?.email}
                </span>
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {initials}
                </div>
            </div>
        </header>
    );
}