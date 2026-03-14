import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';
import type { CreateProgressPhotoInput, UpdateProgressPhotoInput } from '../validations/progress.validation';

export class ProgressService {
  // Create progress photo
  async createProgressPhoto(userId: string, data: CreateProgressPhotoInput) {
    // Parse takenAt date or use current date
    const takenAt = data.takenAt ? new Date(data.takenAt) : new Date();

    const progressPhoto = await prisma.progressPhoto.create({
      data: {
        userId,
        photoUrl: data.photoUrl,
        notes: data.notes,
        hairLength: data.currentLength,
        takenAt,
      },
    });

    // Update user's hair profile with latest length if provided
    if (data.currentLength) {
      const profile = await prisma.hairProfile.findUnique({
        where: { userId },
      });

      if (profile) {
        await prisma.hairProfile.update({
          where: { userId },
          data: { currentLength: data.currentLength },
        });
      }
    }

    return progressPhoto;
  }

  // Get all progress photos for a user
  async getUserProgressPhotos(userId: string, options: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    if (!userId) {
      throw ApiError.badRequest('User ID is required');
    }

    const { limit = 50, offset = 0, startDate, endDate } = options;

    const where: any = { userId };

    if (startDate || endDate) {
      where.takenAt = {};
      if (startDate) where.takenAt.gte = startDate;
      if (endDate) where.takenAt.lte = endDate;
    }

    const [photos, total] = await Promise.all([
      prisma.progressPhoto.findMany({
        where,
        orderBy: { takenAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.progressPhoto.count({ where }),
    ]);

    return { photos, total };
  }

  // Get single progress photo
  async getProgressPhotoById(id: string, userId: string) {
    const photo = await prisma.progressPhoto.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!photo) {
      throw ApiError.notFound('Progress photo not found');
    }

    return photo;
  }

  // Update progress photo
  async updateProgressPhoto(id: string, userId: string, data: UpdateProgressPhotoInput) {
    const photo = await prisma.progressPhoto.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!photo) {
      throw ApiError.notFound('Progress photo not found');
    }

    const updateData: any = { ...data };
    if (data.currentLength !== undefined) {
      updateData.hairLength = data.currentLength;
      delete updateData.currentLength;
    }

    const updated = await prisma.progressPhoto.update({
      where: { id },
      data: updateData,
    });

    // Update profile length if provided
    if (data.currentLength) {
      const profile = await prisma.hairProfile.findUnique({
        where: { userId },
      });

      if (profile) {
        await prisma.hairProfile.update({
          where: { userId },
          data: { currentLength: data.currentLength },
        });
      }
    }

    return updated;
  }

  // Delete progress photo
  async deleteProgressPhoto(id: string, userId: string) {
    const photo = await prisma.progressPhoto.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!photo) {
      throw ApiError.notFound('Progress photo not found');
    }

    await prisma.progressPhoto.delete({
      where: { id },
    });
  }

  // Get growth statistics
  // Get growth statistics
  async getGrowthStats(userId: string) {
    if (!userId) {
      throw ApiError.badRequest('User ID is required');
    }

    const photos = await prisma.progressPhoto.findMany({
      where: {
        userId,
      },
      orderBy: { takenAt: 'asc' },
      select: {
        hairLength: true,
        takenAt: true,
      },
    });

    const totalPhotos = photos.length;
    const measuredPhotos = photos.filter(p => p.hairLength !== null);

    if (measuredPhotos.length === 0) {
      return {
        totalPhotos,
        firstPhoto: null,
        latestPhoto: null,
        totalGrowth: 0,
        averageGrowthPerMonth: 0,
        journeyDays: 0,
      };
    }

    const firstPhoto = measuredPhotos[0];
    const latestPhoto = measuredPhotos[measuredPhotos.length - 1];

    const firstLength = firstPhoto.hairLength || 0;
    const latestLength = latestPhoto.hairLength || 0;
    const totalGrowth = latestLength - firstLength;

    // Calculate journey duration in days
    const journeyDays = Math.floor(
      (new Date(latestPhoto.takenAt).getTime() - new Date(firstPhoto.takenAt).getTime()) /
      (1000 * 60 * 60 * 24)
    );

    // Calculate average growth per month
    const months = journeyDays / 30;
    const averageGrowthPerMonth = months > 0 ? totalGrowth / months : 0;

    return {
      totalPhotos,
      firstPhoto: {
        length: firstLength,
        date: firstPhoto.takenAt,
      },
      latestPhoto: {
        length: latestLength,
        date: latestPhoto.takenAt,
      },
      totalGrowth: parseFloat(totalGrowth.toFixed(2)),
      averageGrowthPerMonth: parseFloat(averageGrowthPerMonth.toFixed(2)),
      journeyDays,
    };
  }

  // Get before/after comparison
  async getBeforeAfterComparison(userId: string) {
    if (!userId) {
      throw ApiError.badRequest('User ID is required');
    }

    const photos = await prisma.progressPhoto.findMany({
      where: { userId },
      orderBy: { takenAt: 'asc' },
      take: 1,
    });

    const latestPhotos = await prisma.progressPhoto.findMany({
      where: { userId },
      orderBy: { takenAt: 'desc' },
      take: 1,
    });

    if (photos.length === 0 || latestPhotos.length === 0) {
      return null;
    }

    const beforePhoto = photos[0];
    const afterPhoto = latestPhotos[0];

    // Don't show comparison if they're the same photo
    if (beforePhoto.id === afterPhoto.id && photos.length === 1) {
      return null;
    }

    const lengthChange = afterPhoto.hairLength && beforePhoto.hairLength
      ? afterPhoto.hairLength - beforePhoto.hairLength
      : null;

    const daysBetween = Math.floor(
      (new Date(afterPhoto.takenAt).getTime() - new Date(beforePhoto.takenAt).getTime()) /
      (1000 * 60 * 60 * 24)
    );

    return {
      before: beforePhoto,
      after: afterPhoto,
      lengthChange,
      daysBetween,
    };
  }

  // Get progress milestones
  async getProgressMilestones(userId: string) {
    if (!userId) {
      throw ApiError.badRequest('User ID is required');
    }
    const stats = await this.getGrowthStats(userId);

    const milestones = [];

    // First photo milestone
    if (stats.firstPhoto) {
      milestones.push({
        type: 'first_photo',
        title: 'Journey Began',
        description: 'You took your first progress photo',
        date: stats.firstPhoto.date,
        icon: '🌱',
      });
    }

    // 30-day milestone
    if (stats.journeyDays >= 30) {
      milestones.push({
        type: '30_days',
        title: '30 Days Strong',
        description: 'One month into your journey',
        icon: '📅',
      });
    }

    // 90-day milestone
    if (stats.journeyDays >= 90) {
      milestones.push({
        type: '90_days',
        title: '90 Days Milestone',
        description: 'Three months of dedication',
        icon: '🎯',
      });
    }

    // 6-month milestone
    if (stats.journeyDays >= 180) {
      milestones.push({
        type: '6_months',
        title: 'Half Year Achievement',
        description: 'Six months of consistent care',
        icon: '⭐',
      });
    }

    // 1-year milestone
    if (stats.journeyDays >= 365) {
      milestones.push({
        type: '1_year',
        title: 'One Year Anniversary',
        description: 'A full year of growth',
        icon: '🎉',
      });
    }

    // Growth milestones
    if (stats.totalGrowth >= 5) {
      milestones.push({
        type: 'growth_5cm',
        title: '5cm Growth',
        description: 'You\'ve grown 5 centimeters',
        icon: '📈',
      });
    }

    if (stats.totalGrowth >= 10) {
      milestones.push({
        type: 'growth_10cm',
        title: '10cm Growth',
        description: 'Double digits! 10 centimeters of growth',
        icon: '🚀',
      });
    }

    if (stats.totalGrowth >= 20) {
      milestones.push({
        type: 'growth_20cm',
        title: '20cm Growth',
        description: 'Amazing! 20 centimeters of growth',
        icon: '🏆',
      });
    }

    return milestones;
  }
}
