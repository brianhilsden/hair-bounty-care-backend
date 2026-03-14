import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

const uploadService = new UploadService();

export class UploadController {
  async uploadHairPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      if (!req.file) {
        throw ApiError.badRequest('No file uploaded');
      }

      const result = await uploadService.uploadImage(req.file, 'hair-bounty/hair-photos');

      return ApiResponse.success(
        res,
        { url: result.url, publicId: result.publicId },
        'Hair photo uploaded successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      if (!req.file) {
        throw ApiError.badRequest('No file uploaded');
      }

      const result = await uploadService.uploadImage(req.file, 'hair-bounty/avatars');

      return ApiResponse.success(
        res,
        { url: result.url, publicId: result.publicId },
        'Avatar uploaded successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async uploadProgressPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      if (!req.file) {
        throw ApiError.badRequest('No file uploaded');
      }

      const result = await uploadService.uploadImage(req.file, 'hair-bounty/progress-photos');

      return ApiResponse.success(
        res,
        { url: result.url, publicId: result.publicId },
        'Progress photo uploaded successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}
