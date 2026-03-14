import { Request, Response, NextFunction } from 'express';
import { ReviewsService } from '../services/reviews.service';
import { ApiResponse } from '../utils/apiResponse';

const reviewsService = new ReviewsService();

export class ReviewsController {
  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId, page, limit } = req.query;
      const reviews = await reviewsService.getReviews({
        targetType: targetType as string | undefined,
        targetId: targetId as string | undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      return ApiResponse.success(res, reviews);
    } catch (error) { next(error); }
  }

  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { targetType, targetId, rating, content, imageUrls } = req.body;
      const review = await reviewsService.createReview(userId, {
        targetType,
        targetId,
        rating,
        content,
        imageUrls,
      });
      return ApiResponse.created(res, review, 'Review posted');
    } catch (error) { next(error); }
  }

  async getReviewsForTarget(req: Request, res: Response, next: NextFunction) {
    try {
      const targetType = req.params.targetType as string;
      const targetId = req.params.targetId as string;
      const reviews = await reviewsService.getReviewsForTarget(targetType, targetId);
      return ApiResponse.success(res, reviews);
    } catch (error) { next(error); }
  }
}
