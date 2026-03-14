import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';

export class NewsletterController {
  async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return ApiResponse.error(res, 'Email is required', 400);
      }

      const subscription = await prisma.newsletterSubscription.upsert({
        where: { email },
        update: { isActive: true },
        create: { email },
      });

      return ApiResponse.success(res, subscription, 'Subscribed successfully');
    } catch (error) { next(error); }
  }
}
