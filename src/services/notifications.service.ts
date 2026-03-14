import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';
import https from 'https';

const EXPO_PUSH_URL = 'https://exp.host/--/push/v2/send';

export class NotificationsService {
  // ─── Internal: send push + create in-app notification ─────────────────────
  async sendToUser(params: {
    userId: string;
    title: string;
    body: string;
    type: string;
    data?: object;
  }) {
    const { userId, title, body, type, data = {} } = params;

    // Always create in-app notification
    await this.createNotification({ userId, title, body, type, notificationData: data });

    // Send push if user has a token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true },
    });

    if (user?.pushToken) {
      try {
        await this.sendPushNotification(user.pushToken, title, body, data);
      } catch {
        // Push failure should never break the main flow
      }
    }
  }

  // ─── Internal: fire-and-forget push via Expo Push API ─────────────────────
  private sendPushNotification(
    token: string,
    title: string,
    body: string,
    data: object
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        to: token,
        title,
        body,
        data,
        sound: 'default',
        priority: 'high',
      });

      const url = new URL(EXPO_PUSH_URL);
      const options: https.RequestOptions = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res) => {
        // Drain response to free socket
        res.resume();
        res.on('end', () => resolve());
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  async getNotifications(userId: string, params: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 30 } = params;

    const [notifications, total, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount, page, limit };
  }

  async markRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw ApiError.notFound('Notification not found');

    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  }

  async registerPushToken(userId: string, pushToken: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });
    return { registered: true };
  }

  async createNotification(data: {
    userId: string;
    title: string;
    body: string;
    type: string;
    notificationData?: object;
  }) {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type,
        data: data.notificationData ?? {},
      },
    });
  }
}

export const notificationsService = new NotificationsService();
