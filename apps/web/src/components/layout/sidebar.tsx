'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logoImage from '../../../public/logo.png';
import ThemeToggle from '@/components/theme-toggle';
import {
    LayoutDashboard,
    FolderOpen,
    FileText,
    Bot,
    LogOut,
    Zap,
    FolderGit2,
    Code,
    Bug,
    FileSignature,
    Settings
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Workspaces', href: '/dashboard/workspaces', icon: FolderOpen },
    { label: 'Projects', href: '/dashboard/projects', icon: FolderGit2 },
    { label: 'Notes', href: '/dashboard/notes', icon: FileText },
    { label: 'AI Chat', href: '/dashboard/chat', icon: Bot },
    { label: 'Code Analysis', href: '/dashboard/analysis', icon: Code },
    { label: 'AI Debugger', href: '/dashboard/debug', icon: Bug },
    { label: 'Docs Generator', href: '/dashboard/docs', icon: FileSignature },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
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
            <div className="flex items-center justify-between mb-8 px-2">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Image src={logoImage} alt="DevFlow AI Logo" className="w-8 h-8 rounded" />
                    <span className="text-lg font-bold">DevFlow AI</span>
                </Link>
                <ThemeToggle />
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