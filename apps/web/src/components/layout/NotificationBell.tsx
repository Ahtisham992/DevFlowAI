'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useSocket } from '@/components/providers/SocketProvider';
import api from '@/lib/axios';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<{title: string, message: string} | null>(null);

  // Fetch initial unread notifications
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get<Notification[]>('/notifications');
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    fetchUnread();
  }, []);

  // Listen to socket events
  useEffect(() => {
    if (!socket) return;

    // Listen for new persisted notifications
    socket.on('notification.new', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      showToast(notification.title, notification.message);
    });

    // Listen for progress updates (ephemeral)
    socket.on('repo.indexing.progress', (data: any) => {
      showToast('Indexing Repository', data.message);
    });

    return () => {
      socket.off('notification.new');
      socket.off('repo.indexing.progress');
    };
  }, [socket]);

  const showToast = (title: string, message: string) => {
    setActiveToast({ title, message });
    setTimeout(() => setActiveToast(null), 3000);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
        )}
      </button>

      {/* Toast popup */}
      {activeToast && (
        <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg p-4 w-72 animate-in slide-in-from-bottom-5 z-50">
          <div className="flex gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
            <div>
              <h4 className="font-bold text-sm">{activeToast.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{activeToast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between bg-muted/30">
            <h3 className="font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-4 border-b last:border-0 hover:bg-muted/50 transition ${!n.read ? 'bg-primary/5' : ''}`}
                >
                  <h4 className="font-semibold text-sm">{n.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-2 opacity-70">
                    {new Date(n.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
