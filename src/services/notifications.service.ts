import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';

export class NotificationsService {
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

  // Internal helper — create a notification for a user
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
