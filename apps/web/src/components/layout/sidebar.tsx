'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    FolderOpen,
    FileText,
    Bot,
    LogOut,
    Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Workspaces', href: '/dashboard/workspaces', icon: FolderOpen },
    { label: 'Notes', href: '/dashboard/notes', icon: FileText },
    { label: 'AI Chat', href: '/dashboard/chat', icon: Bot },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { clearAuth, user } = useAuthStore();

    const handleLogout = () => {
        document.cookie = 'accessToken=; path=/; max-age=0';
        clearAuth();
        router.push('/login');
    };

    return (
        <aside className="w-64 border-r flex flex-col h-screen p-4">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8 px-2">
                <Zap className="w-6 h-6 text-primary" />
                <span className="text-lg font-bold">DevFlow AI</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="border-t pt-4 space-y-2">
                <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground w-full transition"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}