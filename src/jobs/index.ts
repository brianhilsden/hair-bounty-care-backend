import { runStreakAtRiskJob } from './streakAtRisk.job';
import { runMonthlyProgressJob } from './monthlyProgress.job';

function shouldRunStreakJob(): boolean {
  const now = new Date();
  return now.getHours() === 19 && now.getMinutes() === 0;
}

function shouldRunMonthlyJob(): boolean {
  const now = new Date();
  return now.getDate() === 1 && now.getHours() === 9 && now.getMinutes() === 0;
}

export function startJobs() {
  let lastStreakRun = '';
  let lastMonthlyRun = '';

  setInterval(() => {
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
  }, 60 * 1000); // check every minute

  console.log('[Jobs] Scheduled jobs started');
}
