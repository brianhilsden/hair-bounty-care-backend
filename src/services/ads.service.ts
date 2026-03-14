import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';

export class AdsService {
  async getAd(placement: string) {
    const now = new Date();
    const ad = await prisma.ad.findFirst({
      where: {
        placement,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { impressions: 'asc' }, // rotate least-shown ad first
    });

    if (!ad) return null;

    // Track impression
    await prisma.ad.update({
      where: { id: ad.id },
      data: { impressions: { increment: 1 } },
    });

    return ad;
  }

  async trackClick(adId: string) {
    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) throw ApiError.notFound('Ad not found');

    await prisma.ad.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } },
    });

    return { targetUrl: ad.targetUrl };
  }
}
