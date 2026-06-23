'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const { user, setAuth } = useAuthStore();
    
    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsUpdatingProfile(true);
        setProfileMessage('');

        try {
            const { data } = await api.put('/auth/profile', { name });
            // Update auth store with new user data
            setAuth(data, document.cookie.split('accessToken=')[1]?.split(';')[0] || '');
            setProfileMessage('Profile updated successfully!');
        } catch (error: any) {
            setProfileMessage(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage('');

        if (newPassword !== confirmPassword) {
            setPasswordMessage('New passwords do not match');
            return;
        }

        setIsUpdatingPassword(true);

        try {
            await api.put('/auth/change-password', {
                currentPassword,
                newPassword
            });
            setPasswordMessage('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setPasswordMessage(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="max-w-2xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
                <p className="text-muted-foreground">Manage your profile and security preferences.</p>
            </div>

            {/* Profile Section */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b bg-muted/20">
                    <h2 className="text-xl font-semibold">Profile Information</h2>
                    <p className="text-sm text-muted-foreground mt-1">Update your personal details.</p>
                </div>
                <div className="p-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email Address</label>
                            <input 
                                type="email" 
                                value={user?.email || ''} 
                                disabled 
                                className="w-full border rounded-lg px-4 py-2 bg-muted/50 text-muted-foreground cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        {profileMessage && (
                            <p className={`text-sm ${profileMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                {profileMessage}
                            </p>
                        )}

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={isUpdatingProfile || !name.trim()}
                                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                            >
                                {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b bg-muted/20">
                    <h2 className="text-xl font-semibold">Security</h2>
                    <p className="text-sm text-muted-foreground mt-1">Update your password to keep your account secure.</p>
                </div>
                <div className="p-6">
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Current Password</label>
                            <input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                minLength={6}
                            />
                        </div>

                        {passwordMessage && (
                            <p className={`text-sm ${passwordMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                {passwordMessage}
                            </p>
                        )}

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center min-w-[180px]"
                            >
                                {isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
