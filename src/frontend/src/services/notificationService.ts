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
  startPolling(): void;
  stopPolling(): void;
  onNotification(callback: (notification: Notification) => void): void;
  offNotification(callback: (notification: Notification) => void): void;
  getNotifications(limit?: number, unreadOnly?: boolean): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
}

class NotificationServiceImpl implements NotificationService {
  private notificationCallbacks: ((notification: Notification) => void)[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastNotificationId: string | null = null;

  startPolling(): void {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(async () => {
      try {
        const notifications = await this.getNotifications(10, true);
        const newNotifications = notifications.filter(n => 
          !this.lastNotificationId || n.id > this.lastNotificationId
        );

        if (newNotifications.length > 0) {
          this.lastNotificationId = newNotifications[newNotifications.length - 1].id;
          newNotifications.forEach(notification => {
            this.notificationCallbacks.forEach(callback => callback(notification));
          });
        }
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    }, 5000); // Poll every 5 seconds
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
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
    return this.pollingInterval !== null;
  }
}

export const notificationService = new NotificationServiceImpl();
export default notificationService; 