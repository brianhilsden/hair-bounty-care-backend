import { Request, Response, NextFunction } from 'express';
import { AdsService } from '../services/ads.service';
import { ApiResponse } from '../utils/apiResponse';

const adsService = new AdsService();

export class AdsController {
  async getAd(req: Request, res: Response, next: NextFunction) {
    try {
      const ad = await adsService.getAd(req.params.placement as string);
      return ApiResponse.success(res, ad);
    } catch (error) { next(error); }
  }

  async trackClick(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adsService.trackClick(req.params.id as string);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }
}
