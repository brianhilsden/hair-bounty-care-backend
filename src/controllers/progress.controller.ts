import { Request, Response, NextFunction } from 'express';
import { ProgressService } from '../services/progress.service';
import { ApiError } from '../utils/apiError';

const progressService = new ProgressService();

export class ProgressController {
  async createProgressPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const photo = await progressService.createProgressPhoto(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Progress photo created successfully',
        data: photo,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserProgressPhotos(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const { limit, offset, startDate, endDate } = req.query;

      const options: any = {};
      if (limit) options.limit = parseInt(limit as string);
      if (offset) options.offset = parseInt(offset as string);
      if (startDate) options.startDate = new Date(startDate as string);
      if (endDate) options.endDate = new Date(endDate as string);

      const result = await progressService.getUserProgressPhotos(userId, options);
      res.json({
        success: true,
        data: result.photos,
        meta: {
          total: result.total,
          limit: options.limit || 50,
          offset: options.offset || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProgressPhotoById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const photo = await progressService.getProgressPhotoById(req.params.id as string, userId);
      res.json({
        success: true,
        data: photo,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProgressPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const photo = await progressService.updateProgressPhoto(req.params.id as string, userId, req.body);
      res.json({
        success: true,
        message: 'Progress photo updated successfully',
        data: photo,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProgressPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      await progressService.deleteProgressPhoto(req.params.id as string, userId);
      res.json({
        success: true,
        message: 'Progress photo deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getGrowthStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const stats = await progressService.getGrowthStats(userId);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBeforeAfterComparison(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const comparison = await progressService.getBeforeAfterComparison(userId);
      res.json({
        success: true,
        data: comparison,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProgressMilestones(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const milestones = await progressService.getProgressMilestones(userId);
      res.json({
        success: true,
        data: milestones,
      });
    } catch (error) {
      next(error);
    }
  }
}
