import { Request, Response, NextFunction } from 'express';
import { OffersService } from '../services/offers.service';
import { ApiResponse } from '../utils/apiResponse';

const offersService = new OffersService();

export class OffersController {
  async getActiveOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const offers = await offersService.getActiveOffers();
      return ApiResponse.success(res, offers);
    } catch (error) { next(error); }
  }

  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      if (!code) return ApiResponse.error(res, 'code is required', 400);
      const result = await offersService.validate(code);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      if (!code) return ApiResponse.error(res, 'code is required', 400);
      const result = await offersService.apply(code);
      return ApiResponse.success(res, result, 'Offer applied successfully');
    } catch (error) { next(error); }
  }
}
