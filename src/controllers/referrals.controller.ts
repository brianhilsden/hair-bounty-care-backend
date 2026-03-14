import { Request, Response, NextFunction } from 'express';
import { ReferralsService } from '../services/referrals.service';
import { ApiResponse } from '../utils/apiResponse';

const referralsService = new ReferralsService();

export class ReferralsController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const stats = await referralsService.getStats(userId);
      return ApiResponse.success(res, stats);
    } catch (error) { next(error); }
  }

  async getCode(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await referralsService.getCode(userId);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      if (!code) {
        return ApiResponse.error(res, 'Referral code is required', 400);
      }
      const result = await referralsService.validate(code);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }
}
