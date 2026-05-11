import { runStreakAtRiskJob } from './streakAtRisk.job';
import { runMonthlyProgressJob } from './monthlyProgress.job';
import { runDailyTipsJob } from './dailyTips.job';
import { prisma } from '../config/database';

function shouldRunStreakJob(): boolean {
  const now = new Date();
  return now.getHours() === 19 && now.getMinutes() === 0;
}

function shouldRunMonthlyJob(): boolean {
  const now = new Date();
  return now.getDate() === 1 && now.getHours() === 9 && now.getMinutes() === 0;
}

// Reads tip dispatch time (UTC) from DB — defaults to 06:00 (= 9AM EAT)
async function getTipDispatchTimeUTC(): Promise<{ hour: number; minute: number }> {
  try {
    const [hourRow, minuteRow] = await Promise.all([
      prisma.appSetting.findUnique({ where: { key: 'tipDispatchHourUTC' } }),
      prisma.appSetting.findUnique({ where: { key: 'tipDispatchMinuteUTC' } }),
    ]);
    const hour = hourRow ? parseInt(hourRow.value, 10) : 6;
    const minute = minuteRow ? parseInt(minuteRow.value, 10) : 0;
    return {
      hour: isNaN(hour) ? 6 : hour,
      minute: isNaN(minute) ? 0 : minute,
    };
  } catch {}
  return { hour: 6, minute: 0 };
}

export function startJobs() {
  let lastStreakRun = '';
  let lastMonthlyRun = '';
  let lastTipsRun = '';

  setInterval(async () => {
    const now = new Date();
    const hourKey = now.toISOString().slice(0, 13);  // YYYY-MM-DDTHH — for streak/monthly
    const dayKey  = now.toISOString().slice(0, 10);  // YYYY-MM-DD    — for tips (once per day)

    if (shouldRunStreakJob() && lastStreakRun !== hourKey) {
      lastStreakRun = hourKey;
      runStreakAtRiskJob().catch((err) => console.error('[streakAtRisk] Error:', err));
    }

    if (shouldRunMonthlyJob() && lastMonthlyRun !== hourKey) {
      lastMonthlyRun = hourKey;
      runMonthlyProgressJob().catch((err) => console.error('[monthlyProgress] Error:', err));
    }

    if (lastTipsRun !== dayKey) {
      const { hour, minute } = await getTipDispatchTimeUTC();
      if (now.getUTCHours() === hour && now.getUTCMinutes() === minute) {
        lastTipsRun = dayKey;
        runDailyTipsJob().catch((err) => console.error('[dailyTips] Error:', err));
      }
    }
  }, 60 * 1000); // check every minute

  console.log('[Jobs] Scheduled jobs started');
}
