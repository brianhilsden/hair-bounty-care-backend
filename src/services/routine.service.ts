import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';
import type { CreateRoutineTemplateInput, UpdateRoutineTemplateInput, LogRoutineInput } from '../validations/routine.validation';

export class RoutineService {
  // Template Management
  async createTemplate(data: CreateRoutineTemplateInput) {
    return await prisma.routineTemplate.create({
      data,
    });
  }

  async getTemplates() {
    return await prisma.routineTemplate.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async getTemplateById(id: string) {
    const template = await prisma.routineTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw ApiError.notFound('Routine template not found');
    }

    return template;
  }

  async updateTemplate(id: string, data: UpdateRoutineTemplateInput) {
    const template = await prisma.routineTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw ApiError.notFound('Routine template not found');
    }

    return await prisma.routineTemplate.update({
      where: { id },
      data,
    });
  }

  async deleteTemplate(id: string) {
    const template = await prisma.routineTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw ApiError.notFound('Routine template not found');
    }

    await prisma.routineTemplate.delete({
      where: { id },
    });
  }

  // Routine Logging
  async logRoutine(userId: string, data: LogRoutineInput) {
    if (!userId) {
      throw ApiError.badRequest('User ID is required');
    }

    // Verify template exists
    const template = await prisma.routineTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      throw ApiError.notFound('Routine template not found');
    }

    // Create log entry
    const log = await prisma.routineLog.create({
      data: {
        userId,
        templateId: data.templateId,
        notes: data.notes,
      },
      include: {
        template: true,
      },
    });

    // Update streak
    await this.updateStreak(userId);

    return log;
  }

  async getUserLogs(userId: string, options: {
    startDate?: Date;
    endDate?: Date;
    templateId?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { startDate, endDate, templateId, limit = 50, offset = 0 } = options;

    const where: any = { userId };

    if (startDate || endDate) {
      where.completedAt = {};
      if (startDate) where.completedAt.gte = startDate;
      if (endDate) where.completedAt.lte = endDate;
    }

    if (templateId) {
      where.templateId = templateId;
    }

    const [logs, total] = await Promise.all([
      prisma.routineLog.findMany({
        where,
        include: {
          template: true,
        },
        orderBy: { completedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.routineLog.count({ where }),
    ]);

    return { logs, total };
  }

  async getTodayRoutines(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completedToday = await prisma.routineLog.findMany({
      where: {
        userId,
        completedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        template: true,
      },
    });

    const allTemplates = await prisma.routineTemplate.findMany({
      where: { isDefault: true },
      orderBy: { name: 'asc' },
    });

    // Map templates with completion status
    const routines = allTemplates.map(template => {
      const completed = completedToday.find(log => log.templateId === template.id);
      return {
        ...template,
        completed: !!completed,
        completedAt: completed?.completedAt,
      };
    });

    return routines;
  }

  async getRoutineStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
      prisma.routineLog.count({
        where: {
          userId,
          completedAt: { gte: today },
        },
      }),
      prisma.routineLog.count({
        where: {
          userId,
          completedAt: { gte: thisWeekStart },
        },
      }),
      prisma.routineLog.count({
        where: {
          userId,
          completedAt: { gte: thisMonthStart },
        },
      }),
      prisma.routineLog.count({
        where: { userId },
      }),
    ]);

    return {
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      total: totalCount,
    };
  }

  // Streak Management
  private async updateStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get or create streak record
    let streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
        },
      });
      return streak;
    }

    // Check if already logged today
    const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);

      // Already logged today
      if (lastActive.getTime() === today.getTime()) {
        return streak;
      }

      // Logged yesterday - continue streak
      if (lastActive.getTime() === yesterday.getTime()) {
        const newStreak = streak.currentStreak + 1;
        return await prisma.streak.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streak.longestStreak),
            lastActiveDate: today,
          },
        });
      }

      // Streak broken - reset to 1
      return await prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          lastActiveDate: today,
        },
      });
    }

    // No previous active date - start streak
    return await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        longestStreak: Math.max(1, streak.longestStreak),
        lastActiveDate: today,
      },
    });
  }

  async getStreak(userId: string) {
    if (!userId) {
      throw ApiError.badRequest('User ID is required');
    }

    let streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    return streak;
  }
}
