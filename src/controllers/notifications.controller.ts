import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from '../services/notifications.service';
import { ApiResponse } from '../utils/apiResponse';

const notificationsService = new NotificationsService();

export class NotificationsController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await notificationsService.getNotifications(req.user!.userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      return ApiResponse.success(res, result.notifications, 'Success', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (error) { next(error); }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.markRead(req.params.id as string, req.user!.userId);
      return ApiResponse.success(res, result, 'Marked as read');
    } catch (error) { next(error); }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.markAllRead(req.user!.userId);
      return ApiResponse.success(res, result, 'All notifications marked as read');
    } catch (error) { next(error); }
  }

  async registerPushToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { pushToken } = req.body;
      if (!pushToken) return ApiResponse.error(res, 'pushToken is required', 400);
      const result = await notificationsService.registerPushToken(req.user!.userId, pushToken);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }
}
