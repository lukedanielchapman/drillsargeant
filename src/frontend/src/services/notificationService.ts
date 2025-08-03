import { io, Socket } from 'socket.io-client';
import { auth } from '../config/firebase';
import apiService from './api';

export interface Notification {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  read?: boolean;
  readAt?: string;
}

export interface NotificationService {
  connect(): Promise<void>;
  disconnect(): void;
  onNotification(callback: (notification: Notification) => void): void;
  offNotification(callback: (notification: Notification) => void): void;
  getNotifications(limit?: number, unreadOnly?: boolean): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
}

class NotificationServiceImpl implements NotificationService {
  private socket: Socket | null = null;
  private notificationCallbacks: ((notification: Notification) => void)[] = [];
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      
      this.socket = io(import.meta.env.VITE_API_URL || 'https://us-central1-drillsargeant-19d36.cloudfunctions.net/api', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Connected to notification service');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from notification service');
        this.isConnected = false;
      });

      this.socket.on('notification', (notification: Notification) => {
        console.log('Received notification:', notification);
        this.notificationCallbacks.forEach(callback => callback(notification));
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('Failed to connect to notification service:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  onNotification(callback: (notification: Notification) => void): void {
    this.notificationCallbacks.push(callback);
  }

  offNotification(callback: (notification: Notification) => void): void {
    const index = this.notificationCallbacks.indexOf(callback);
    if (index > -1) {
      this.notificationCallbacks.splice(index, 1);
    }
  }

  async getNotifications(limit = 50, unreadOnly = false): Promise<Notification[]> {
    return await apiService.getNotifications(limit, unreadOnly);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiService.markNotificationAsRead(notificationId);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await apiService.deleteNotification(notificationId);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const notificationService = new NotificationServiceImpl();
export default notificationService; 