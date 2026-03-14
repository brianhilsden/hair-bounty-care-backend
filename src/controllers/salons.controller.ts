import { Request, Response, NextFunction } from 'express';
import { SalonsService } from '../services/salons.service';
import { ApiResponse } from '../utils/apiResponse';

const salonsService = new SalonsService();

export class SalonsController {
  async getSalons(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        city, search, isHighEnd, isBudget, isKidsFriendly,
        isOrganic, isGreenCertified, specialty, page, limit,
      } = req.query;

      const result = await salonsService.getSalons({
        city: city as string,
        search: search as string,
        isHighEnd: isHighEnd === 'true',
        isBudget: isBudget === 'true',
        isKidsFriendly: isKidsFriendly === 'true',
        isOrganic: isOrganic === 'true',
        isGreenCertified: isGreenCertified === 'true',
        specialty: specialty as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      return ApiResponse.success(res, result.salons, 'Success', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) { next(error); }
  }

  async getSalon(req: Request, res: Response, next: NextFunction) {
    try {
      const salon = await salonsService.getSalon(req.params.id as string);
      return ApiResponse.success(res, salon);
    } catch (error) { next(error); }
  }

  async getNearby(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng, radius, limit } = req.query;
      if (!lat || !lng) {
        return ApiResponse.error(res, 'lat and lng are required', 400);
      }
      const salons = await salonsService.getNearby(
        parseFloat(lat as string),
        parseFloat(lng as string),
        radius ? parseFloat(radius as string) : 20,
        limit ? parseInt(limit as string) : 10,
      );
      return ApiResponse.success(res, salons);
    } catch (error) { next(error); }
  }
}
