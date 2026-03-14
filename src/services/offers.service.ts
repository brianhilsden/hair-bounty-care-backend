import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';

export class OffersService {
  async validate(code: string) {
    const now = new Date();
    const offer = await prisma.offer.findUnique({ where: { code } });

    if (!offer) return { valid: false, message: 'Code not found' };
    if (!offer.isActive) return { valid: false, message: 'This offer is no longer active' };
    if (offer.validFrom > now) return { valid: false, message: 'This offer has not started yet' };
    if (offer.validUntil < now) return { valid: false, message: 'This offer has expired' };
    if (offer.maxUses && offer.usedCount >= offer.maxUses) {
      return { valid: false, message: 'This offer has reached its usage limit' };
    }

    return {
      valid: true,
      offer: {
        id: offer.id,
        title: offer.title,
        description: offer.description,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        minPurchase: offer.minPurchase,
      },
    };
  }

  async apply(code: string) {
    const result = await this.validate(code);
    if (!result.valid) throw ApiError.badRequest(result.message ?? 'Invalid offer');

    // Increment usage count
    await prisma.offer.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });

    return result.offer;
  }

  async getActiveOffers() {
    const now = new Date();
    return await prisma.offer.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      orderBy: { discountValue: 'desc' },
    });
  }
}
