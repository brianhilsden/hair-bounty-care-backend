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

// Reads tip dispatch hour (UTC) from DB — default 6 (= 9AM EAT)
async function getTipDispatchHourUTC(): Promise<number> {
  try {
    const setting = await prisma.appSetting.findUnique({ where: { key: 'tipDispatchHourUTC' } });
    if (setting) {
      const h = parseInt(setting.value, 10);
      if (!isNaN(h) && h >= 0 && h <= 23) return h;
    }
  } catch {}
  return 6; // fallback default: 9AM EAT
}

export function startJobs() {
  let lastStreakRun = '';
  let lastMonthlyRun = '';
  let lastTipsRun = '';

  setInterval(async () => {
    const now = new Date();
    const dateKey = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH

    if (shouldRunStreakJob() && lastStreakRun !== dateKey) {
      lastStreakRun = dateKey;
      runStreakAtRiskJob().catch((err) => console.error('[streakAtRisk] Error:', err));
    }

    if (shouldRunMonthlyJob() && lastMonthlyRun !== dateKey) {
      lastMonthlyRun = dateKey;
      runMonthlyProgressJob().catch((err) => console.error('[monthlyProgress] Error:', err));
    }

    if (lastTipsRun !== dateKey && now.getUTCMinutes() === 0) {
      const dispatchHour = await getTipDispatchHourUTC();
      if (now.getUTCHours() === dispatchHour) {
        lastTipsRun = dateKey;
        runDailyTipsJob().catch((err) => console.error('[dailyTips] Error:', err));
      }
    }
  }, 60 * 1000); // check every minute

  console.log('[Jobs] Scheduled jobs started');
}
