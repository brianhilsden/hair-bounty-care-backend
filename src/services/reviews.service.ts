import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';

export class ReviewsService {
  async getReviews(params: { targetType?: string; targetId?: string; page?: number; limit?: number }) {
    const { targetType, targetId, page = 1, limit = 50 } = params;

    const where: any = {};
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return reviews;
  }

  async createReview(userId: string, data: {
    targetType: 'product' | 'salon' | 'general';
    targetId?: string;
    rating: number;
    content: string;
    imageUrls?: string[];
  }) {
    if (data.rating < 1 || data.rating > 5) {
      throw ApiError.badRequest('Rating must be between 1 and 5');
    }

    const review = await prisma.review.create({
      data: {
        userId,
        targetType: data.targetType,
        targetId: data.targetId,
        rating: data.rating,
        content: data.content,
        imageUrls: data.imageUrls ?? [],
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return review;
  }

  async getReviewsForTarget(targetType: string, targetId: string) {
    return await prisma.review.findMany({
      where: { targetType, targetId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
