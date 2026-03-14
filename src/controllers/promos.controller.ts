import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';

export class PromosController {
  async validatePromo(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      if (!code) {
        return ApiResponse.error(res, 'Promo code is required', 400);
      }

      const offer = await prisma.offer.findUnique({
        where: { code: code.toUpperCase() }, // Assuming codes might be stored uppercase
      });

      if (!offer || !offer.isActive) {
        return ApiResponse.error(res, 'Invalid or inactive promo code', 404);
      }

      const now = new Date();
      if (now < offer.validFrom || now > offer.validUntil) {
        return ApiResponse.error(res, 'Promo code has expired or is not yet valid', 400);
      }

      if (offer.maxUses && offer.usedCount >= offer.maxUses) {
        return ApiResponse.error(res, 'Promo code usage limit reached', 400);
      }

      return ApiResponse.success(res, offer, 'Promo code applied successfully');
    } catch (error) { next(error); }
  }
}
