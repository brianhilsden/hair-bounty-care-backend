import { Request, Response, NextFunction } from 'express';
import { RecommendationsService } from '../services/recommendations.service';
import { ApiResponse } from '../utils/apiResponse';

const recService = new RecommendationsService();

export class RecommendationsController {
  async getHairstyles(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await recService.getHairstyles(req.user!.userId);
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await recService.getProducts(req.user!.userId);
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  async getDIYRecipes(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await recService.getDIYRecipes(req.user!.userId);
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }
}
