import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { notificationsService } from '../services/notifications.service';

const TIP_TITLES: Record<string, string> = {
  moisture: '💧 Moisture Tip',
  growth: '🌱 Growth Tip',
  scalp: '✨ Scalp Care Tip',
  styling: '💫 Styling Tip',
  ingredients: '🔬 Ingredient Insight',
  seasonal: '🌤️ Seasonal Hair Tip',
  protective: '🛡️ Protective Style Tip',
};

export async function runDailyTipsJob() {
  console.log('[dailyTips] Job started');

  const tipCount = await prisma.hairTip.count({ where: { isActive: true } });
  console.log(`[dailyTips] Active tips in pool: ${tipCount}`);

  const users = await prisma.user.findMany({
    where: {
      pushToken: { not: null },
      isOnboarded: true,
      isSuspended: false,
    },
    select: {
      id: true,
      profile: {
        select: {
          curlPattern: true,
          porosity: true,
          goals: true,
        },
      },
    },
  });

  console.log(`[dailyTips] Eligible users: ${users.length}`);

  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      const dispatched = await dispatchTipToUser(user.id, user.profile);
      if (dispatched) sent++;
      else skipped++;
    } catch (err: any) {
      console.error(`[dailyTips] Error for user ${user.id}:`, err?.message ?? err);
    }
  }

  console.log(`[dailyTips] Done — Sent: ${sent}, Skipped: ${skipped}, Total: ${users.length}`);
}

async function dispatchTipToUser(
  userId: string,
  profile: { curlPattern: string | null; porosity: string | null; goals: string[] } | null
) {
  const curlPattern = profile?.curlPattern ?? null;

  // IDs of tips already sent to this user
  const sentRows = await prisma.sentTip.findMany({
    where: { userId },
    select: { tipId: true },
  });
  const sentTipIds = sentRows.map((s) => s.tipId);

  const tip = await findMatchingTip(curlPattern, sentTipIds);

  if (!tip) {
    // Pool exhausted — reset SentTip records and retry once
    if (sentTipIds.length > 0) {
      await prisma.sentTip.deleteMany({ where: { userId } });
      const retryTip = await findMatchingTip(curlPattern, []);
      if (!retryTip) return false;
      return await sendTip(userId, retryTip);
    }
    return false;
  }

  return await sendTip(userId, tip);
}

async function findMatchingTip(
  curlPattern: string | null,
  excludeIds: string[]
): Promise<{ id: string; title: string; body: string; category: string } | null> {
  try {
    if (curlPattern) {
      const rows = await prisma.$queryRaw<{ id: string; title: string; body: string; category: string }[]>(
        buildQuery(curlPattern, excludeIds)
      );
      if (rows.length > 0) return rows[0];
    }

    const rows = await prisma.$queryRaw<{ id: string; title: string; body: string; category: string }[]>(
      buildQuery(null, excludeIds)
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (err: any) {
    console.error('[dailyTips] findMatchingTip error:', err?.message ?? err);
    return null;
  }
}

function buildQuery(curlPattern: string | null, excludeIds: string[]): Prisma.Sql {
  const hairTypeFilter = curlPattern
    ? Prisma.sql`("targetHairTypes"::jsonb @> ${JSON.stringify([curlPattern])}::jsonb OR "targetHairTypes"::jsonb = '[]'::jsonb)`
    : Prisma.sql`"targetHairTypes"::jsonb = '[]'::jsonb`;

  if (excludeIds.length === 0) {
    return Prisma.sql`
      SELECT id, title, body, category
      FROM "HairTip"
      WHERE "isActive" = true
        AND ${hairTypeFilter}
      ORDER BY RANDOM()
      LIMIT 1
    `;
  }

  // Prisma.join builds a safe parameterized list for NOT IN
  return Prisma.sql`
    SELECT id, title, body, category
    FROM "HairTip"
    WHERE "isActive" = true
      AND id NOT IN (${Prisma.join(excludeIds)})
      AND ${hairTypeFilter}
    ORDER BY RANDOM()
    LIMIT 1
  `;
}

async function sendTip(
  userId: string,
  tip: { id: string; title: string; body: string; category: string }
) {
  const notifTitle = TIP_TITLES[tip.category] ?? '✨ Hair Tip';

  await notificationsService.sendToUser({
    userId,
    title: notifTitle,
    body: tip.body,
    type: 'tip',
    data: { tipId: tip.id, tipTitle: tip.title, category: tip.category },
  });

  await prisma.sentTip.create({
    data: { userId, tipId: tip.id },
  });

  return true;
}
