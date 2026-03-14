import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';
import { notificationsService } from './notifications.service';

export class GamificationService {
  // Badge Management
  async getAllBadges() {
    return await prisma.badge.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getUserBadges(userId: string) {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    return userBadges.map(ub => ({
      ...ub.badge,
      earnedAt: ub.earnedAt,
    }));
  }

  async awardBadge(userId: string, badgeId: string) {
    // Check if badge exists
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge) {
      throw ApiError.notFound('Badge not found');
    }

    // Check if user already has this badge
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
    });

    if (existing) {
      throw ApiError.conflict('User already has this badge');
    }

    // Award badge
    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
      },
      include: {
        badge: true,
      },
    });

    return userBadge;
  }

  async checkAndAwardBadges(userId: string) {
    // Get user stats
    const routineCount = await prisma.routineLog.count({
      where: { userId },
    });

    const streak = await prisma.streak.findUnique({
      where: { userId },
    });

    const badges = await prisma.badge.findMany();
    const userBadges = await this.getUserBadges(userId);
    const userBadgeIds = userBadges.map(ub => ub.id);

    const newBadges = [];

    // Check each badge criteria
    for (const badge of badges) {
      if (userBadgeIds.includes(badge.id)) continue;

      const criteria = JSON.parse(badge.requirement);
      let earned = false;

      if (criteria.type === 'routine_count' && routineCount >= criteria.count) {
        earned = true;
      } else if (criteria.type === 'streak' && streak && streak.currentStreak >= criteria.days) {
        earned = true;
      } else if (criteria.type === 'longest_streak' && streak && streak.longestStreak >= criteria.days) {
        earned = true;
      }

      if (earned) {
        await this.awardBadge(userId, badge.id);
        newBadges.push(badge);
        await notificationsService.sendToUser({
          userId,
          title: '🏅 Badge Earned!',
          body: `You just earned the "${badge.name}" badge. Keep it up!`,
          type: 'badge_earned',
          data: { badgeId: badge.id },
        });
      }
    }

    return newBadges;
  }

  // Leaderboard Management
  async getLeaderboard(options: { period?: 'weekly' | 'all-time'; limit?: number } = {}) {
    const { period = 'all-time', limit = 50 } = options;

    let startDate: Date | undefined;
    if (period === 'weekly') {
      const today = new Date();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay()); // Start of week
      startDate.setHours(0, 0, 0, 0);
    }

    // Calculate scores based on routine logs
    const users = await prisma.user.findMany({
      where: {
        isOnboarded: true,
        routineLogs: {
          some: startDate ? { completedAt: { gte: startDate } } : {},
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        routineLogs: {
          where: startDate ? { completedAt: { gte: startDate } } : {},
          select: { id: true },
        },
        streaks: {
          select: {
            currentStreak: true,
            longestStreak: true,
          },
        },
        badges: {
          select: { id: true },
        },
      },
      take: limit,
    });

    // Calculate scores: 10 points per routine log, 5 points per current streak day, 2 points per badge
    const leaderboard = users
      .map(user => {
        const routinePoints = user.routineLogs.length * 10;
        const streakPoints = (user.streaks?.currentStreak || 0) * 5;
        const badgePoints = user.badges.length * 2;
        const totalScore = routinePoints + streakPoints + badgePoints;

        return {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          score: totalScore,
          routineCount: user.routineLogs.length,
          currentStreak: user.streaks?.currentStreak || 0,
          badgeCount: user.badges.length,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return leaderboard;
  }

  async getUserRank(userId: string, period: 'weekly' | 'all-time' = 'all-time') {
    const leaderboard = await this.getLeaderboard({ period, limit: 1000 });
    const userEntry = leaderboard.find(entry => entry.userId === userId);

    if (!userEntry) {
      return {
        rank: null,
        score: 0,
        routineCount: 0,
        currentStreak: 0,
        badgeCount: 0,
      };
    }

    return userEntry;
  }
}
