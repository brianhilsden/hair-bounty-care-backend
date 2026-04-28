import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';
import { notificationsService } from './notifications.service';
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

    // Get user's hair profile for filtering
    const hairProfile = await prisma.hairProfile.findUnique({
      where: { userId },
    });

    // Get user's explicitly selected routine templates
    const userRoutines = await prisma.userRoutineTemplate.findMany({
      where: { userId },
      include: { template: true },
    });

    const userSelectedTemplateIds = new Set(userRoutines.map(ur => ur.templateId));

    let templates;

    if (userRoutines.length > 0) {
      // User has explicitly selected templates — use those (always show regardless of frequency)
      templates = userRoutines.map(ur => ur.template);
    } else {
      // Fallback: use default templates, filtered by frequency
      const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon
      const dayOfMonth = new Date().getDate();

      const allDefaults = await prisma.routineTemplate.findMany({
        where: { isDefault: true, isActive: true },
        orderBy: { name: 'asc' },
      });

      templates = allDefaults.filter(t => {
        if (t.frequency === 'daily') return true;
        if (t.frequency === 'weekly') return dayOfWeek === 1;
        if (t.frequency === 'monthly') return dayOfMonth === 1;
        return false;
      });
    }

    // Filter by hair profile if profile exists
    if (hairProfile) {
      templates = templates.filter(t => {
        // If template has targetHairTypes and user has a curlPattern, check match
        if (t.targetHairTypes.length > 0 && hairProfile.curlPattern) {
          if (!t.targetHairTypes.includes(hairProfile.curlPattern)) return false;
        }
        // If template has targetPorosities and user has porosity, check match
        if (t.targetPorosities.length > 0 && hairProfile.porosity) {
          if (!t.targetPorosities.includes(hairProfile.porosity)) return false;
        }
        // If template has targetGoals and user has goals, check at least one match
        if (t.targetGoals.length > 0 && hairProfile.goals && hairProfile.goals.length > 0) {
          const hasMatch = t.targetGoals.some(g => (hairProfile.goals as string[]).includes(g));
          if (!hasMatch) return false;
        }
        return true;
      });
    }

    // Map templates with completion status
    const routines = templates.map(template => {
      const completed = completedToday.find(log => log.templateId === template.id);
      return {
        ...template,
        completed: !!completed,
        completedAt: completed?.completedAt,
      };
    });

    return routines;
  }

  // User Routine Template Management
  async getUserRoutineTemplates(userId: string) {
    const [selectedUserRoutines, allTemplates] = await Promise.all([
      prisma.userRoutineTemplate.findMany({
        where: { userId },
        include: { template: true },
        orderBy: { addedAt: 'asc' },
      }),
      prisma.routineTemplate.findMany({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      }),
    ]);

    const selected = selectedUserRoutines.map(ur => ur.template);

    return { selected, available: allTemplates };
  }

  async addUserRoutineTemplate(userId: string, templateId: string) {
    // Verify template exists and is active
    const template = await prisma.routineTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw ApiError.notFound('Routine template not found');
    }

    if (!template.isActive) {
      throw ApiError.badRequest('Routine template is not active');
    }

    return await prisma.userRoutineTemplate.upsert({
      where: { userId_templateId: { userId, templateId } },
      update: {},
      create: { userId, templateId },
    });
  }

  async removeUserRoutineTemplate(userId: string, templateId: string) {
    const record = await prisma.userRoutineTemplate.findUnique({
      where: { userId_templateId: { userId, templateId } },
    });

    if (!record) {
      throw ApiError.notFound('Routine not found in your list');
    }

    await prisma.userRoutineTemplate.delete({
      where: { userId_templateId: { userId, templateId } },
    });
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
        const updated = await prisma.streak.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streak.longestStreak),
            lastActiveDate: today,
          },
        });

        if ([7, 30, 100].includes(newStreak)) {
          await notificationsService.sendToUser({
            userId,
            title: `🔥 ${newStreak}-Day Streak!`,
            body: `Incredible! You've kept up your hair care routine for ${newStreak} days straight.`,
            type: 'streak_milestone',
            data: { streak: newStreak },
          });
        }

        return updated;
      }

      // Streak broken - reset to 1
      const brokenStreak = streak.currentStreak;
      const result = await prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          lastActiveDate: today,
        },
      });

      if (brokenStreak >= 3) {
        await notificationsService.sendToUser({
          userId,
          title: '😔 Streak Broken',
          body: `Your ${brokenStreak}-day streak ended, but you're back today! Keep going.`,
          type: 'streak_broken',
          data: { previousStreak: brokenStreak },
        });
      }

      return result;
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
