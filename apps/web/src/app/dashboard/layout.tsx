'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import LoadingScreen from '@/components/loading-screen';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { SocketProvider } from '@/components/providers/SocketProvider';

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
        <SocketProvider>
            <div className="min-h-screen bg-background flex flex-col md:flex-row">
                {/* Mobile Header (visible only on md:hidden) */}
                <div className="md:hidden">
                    <Header />
                </div>
                
                {/* Sidebar (hidden on mobile, fixed on desktop) */}
                <aside className="hidden md:flex w-64 flex-col border-r bg-card fixed h-screen">
                    <Sidebar />
                </aside>
                
                {/* Main Content Area */}
                <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                    {/* Desktop Header */}
                    <div className="hidden md:block">
                        <Header />
                    </div>
                    
                    <main className="flex-1 p-6 overflow-auto">
                        <div className="max-w-6xl mx-auto w-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SocketProvider>
    );
}