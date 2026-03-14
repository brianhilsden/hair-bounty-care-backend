import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';

export class ReferralsService {
  async getStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    if (!user) throw ApiError.notFound('User not found');

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: { firstName: true, lastName: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const discountsEarned = referrals.filter(r => r.discountGiven).length;
    const activeReferrals = referrals.length; // all referred users count as active

    return {
      code: user.referralCode,
      totalReferrals: referrals.length,
      activeReferrals,
      discountsEarned,
      referrals: referrals.map(r => ({
        id: r.id,
        referredUser: {
          firstName: r.referred.firstName,
          lastName: r.referred.lastName,
          createdAt: r.referred.createdAt.toISOString(),
        },
        discountGiven: r.discountGiven,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }

  async getCode(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    if (!user) throw ApiError.notFound('User not found');
    return { code: user.referralCode };
  }

  async validate(code: string) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { firstName: true, lastName: true },
    });

    if (!referrer) return { valid: false };

    return {
      valid: true,
      referrerName: `${referrer.firstName} ${referrer.lastName}`,
    };
  }
}
