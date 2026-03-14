import { Request, Response, NextFunction } from 'express';
import { GamificationService } from '../services/gamification.service';

const gamificationService = new GamificationService();

export class GamificationController {
  async getAllBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const badges = await gamificationService.getAllBadges();
      res.json({
        success: true,
        data: badges,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const badges = await gamificationService.getUserBadges(userId);
      res.json({
        success: true,
        data: badges,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const newBadges = await gamificationService.checkAndAwardBadges(userId);
      res.json({
        success: true,
        message: newBadges.length > 0 ? 'New badges earned!' : 'No new badges',
        data: newBadges,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { period, limit } = req.query;
      const leaderboard = await gamificationService.getLeaderboard({
        period: (period as 'weekly' | 'all-time') || 'all-time',
        limit: limit ? parseInt(limit as string) : 50,
      });
      res.json({
        success: true,
        data: leaderboard,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserRank(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { period } = req.query;
      const rank = await gamificationService.getUserRank(
        userId,
        (period as 'weekly' | 'all-time') || 'all-time'
      );
      res.json({
        success: true,
        data: rank,
      });
    } catch (error) {
      next(error);
    }
  }
}
