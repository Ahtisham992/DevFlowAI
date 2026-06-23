import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { Platform, Alert } from 'react-native';

const SOCKET_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        console.log('Mobile Socket connected:', socketRef.current?.id);
      });

      socketRef.current.on('notification', (data: any) => {
        Alert.alert(
          data.title || 'Notification',
          data.message || 'You have a new notification.'
        );
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Mobile Socket connection error:', error);
      });

      return () => {
        socketRef.current?.disconnect();
        console.log('Mobile Socket disconnected');
      };
    }
  }, [isAuthenticated, token]);

  return socketRef.current;
};
