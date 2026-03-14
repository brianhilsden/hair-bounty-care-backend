import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { ApiResponse } from '../utils/apiResponse';
import type { CreateHairProfileInput, UpdateHairProfileInput } from '../validations/profile.validation';

const profileService = new ProfileService();

export class ProfileController {
  async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const data: CreateHairProfileInput = req.body;
      const profile = await profileService.createProfile(req.user.userId, data);

      return ApiResponse.created(res, profile, 'Hair profile created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const profile = await profileService.getProfile(req.user.userId);

      return ApiResponse.success(res, profile, 'Hair profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const data: UpdateHairProfileInput = req.body;
      const profile = await profileService.updateProfile(req.user.userId, data);

      return ApiResponse.success(res, profile, 'Hair profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      await profileService.deleteProfile(req.user.userId);

      return ApiResponse.success(res, null, 'Hair profile deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getHairTypeDefinitions(req: Request, res: Response, next: NextFunction) {
    try {
      const definitions = await profileService.getHairTypeDefinitions();

      return ApiResponse.success(res, definitions, 'Hair type definitions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
