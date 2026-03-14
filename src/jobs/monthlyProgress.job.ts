import { prisma } from '../config/database';
import { notificationsService } from '../services/notifications.service';

export async function runMonthlyProgressJob() {
  const users = await prisma.user.findMany({
    where: { isOnboarded: true },
    select: { id: true },
  });

  await Promise.all(
    users.map((u) =>
      notificationsService.sendToUser({
        userId: u.id,
        title: '📸 Monthly Progress Check-In',
        body: "It's a new month! Time to capture your hair growth journey.",
        type: 'monthly_progress',
        data: {},
      })
    )
  );

  console.log(`[monthlyProgress] Notified ${users.length} users`);
}
