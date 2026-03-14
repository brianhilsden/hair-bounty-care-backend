import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';

export interface SalonFilters {
  city?: string;
  search?: string;
  isHighEnd?: boolean;
  isBudget?: boolean;
  isKidsFriendly?: boolean;
  isOrganic?: boolean;
  isGreenCertified?: boolean;
  specialty?: string;
  page?: number;
  limit?: number;
}

export class SalonsService {
  async getSalons(filters: SalonFilters = {}) {
    const {
      city, search, isHighEnd, isBudget, isKidsFriendly, isOrganic,
      isGreenCertified, specialty, page = 1, limit = 20,
    } = filters;

    const where: any = {};

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isHighEnd) where.isHighEnd = true;
    if (isBudget) where.isBudget = true;
    if (isKidsFriendly) where.isKidsFriendly = true;
    if (isOrganic) where.isOrganic = true;
    if (isGreenCertified) where.isGreenCertified = true;
    if (specialty) where.specialties = { has: specialty };

    const [salons, total] = await prisma.$transaction([
      prisma.salon.findMany({
        where,
        orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.salon.count({ where }),
    ]);

    return { salons, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getSalon(id: string) {
    const salon = await prisma.salon.findUnique({ where: { id } });
    if (!salon) throw ApiError.notFound('Salon not found');
    return salon;
  }

  async getNearby(lat: number, lng: number, radiusKm = 20, limit = 10) {
    // Simple bounding box approximation (1 degree ≈ 111 km)
    const delta = radiusKm / 111;
    const salons = await prisma.salon.findMany({
      where: {
        latitude: { gte: lat - delta, lte: lat + delta },
        longitude: { gte: lng - delta, lte: lng + delta },
      },
      take: limit,
    });

    // Sort by distance
    return salons
      .map(s => ({
        ...s,
        distance: s.latitude && s.longitude
          ? Math.round(Math.sqrt(
              Math.pow((s.latitude - lat) * 111, 2) +
              Math.pow((s.longitude - lng) * 111, 2)
            ) * 10) / 10
          : null,
      }))
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }
}
