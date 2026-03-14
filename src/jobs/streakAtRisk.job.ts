import { prisma } from '../config/database';
import { notificationsService } from '../services/notifications.service';

export async function runStreakAtRiskJob() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find users with active streaks
  const streaks = await prisma.streak.findMany({
    where: { currentStreak: { gt: 0 } },
    select: { userId: true, currentStreak: true },
  });

  const userIds = streaks.map((s) => s.userId);

  // Find users who HAVE logged today
  const loggedToday = await prisma.routineLog.findMany({
    where: {
      userId: { in: userIds },
      completedAt: { gte: today, lt: tomorrow },
    },
    select: { userId: true },
  });

  const loggedTodayIds = new Set(loggedToday.map((l) => l.userId));

  // Filter to users who have NOT logged today
  const atRisk = streaks.filter((s) => !loggedTodayIds.has(s.userId));

  await Promise.all(
    atRisk.map((s) =>
      notificationsService.sendToUser({
        userId: s.userId,
        title: '🔥 Streak at Risk!',
        body: `Don't break your ${s.currentStreak}-day streak! Log today's routine before midnight.`,
        type: 'streak_at_risk',
        data: { currentStreak: s.currentStreak },
      })
    )
  );

  console.log(`[streakAtRisk] Notified ${atRisk.length} users`);
}
