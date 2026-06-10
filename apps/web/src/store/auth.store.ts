'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            setAuth: (user, accessToken, refreshToken) => {
                localStorage.setItem('refreshToken', refreshToken);
                set({ user, accessToken, isAuthenticated: true });
            },
            clearAuth: () => {
                localStorage.removeItem('refreshToken');
                set({ user: null, accessToken: null, isAuthenticated: false });
            },
        }),
        {
            name: 'devflow-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);