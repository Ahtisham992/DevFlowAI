'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { NotificationBell } from './NotificationBell';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Sidebar from './sidebar';
import { useState, useEffect } from 'react';

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/workspaces': 'Workspaces',
    '/dashboard/projects': 'Projects',
    '/dashboard/notes': 'Notes',
    '/dashboard/chat': 'AI Chat',
    '/dashboard/analysis': 'Code Analysis',
    '/dashboard/debug': 'AI Debugger',
    '/dashboard/docs': 'Docs Generator',
    '/dashboard/settings': 'Settings',
};

export default function Header() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const title = pageTitles[pathname] ?? 'DevFlow AI';
    const [open, setOpen] = useState(false);

    // Close the mobile menu whenever the route changes
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
        : user?.email?.[0].toUpperCase() ?? '?';

    return (
        <header className="h-14 border-b flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <button className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground transition">
                            <Menu className="w-5 h-5" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 border-r">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <Sidebar />
                    </SheetContent>
                </Sheet>
                <h2 className="font-semibold text-lg">{title}</h2>
            </div>
            
            <div className="flex items-center gap-3">
                <NotificationBell />
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