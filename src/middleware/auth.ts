import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { prisma } from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyAccessToken(token);

      // Check if user is suspended
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { isSuspended: true },
      });
      if (user?.isSuspended) {
        throw ApiError.forbidden('Your account has been suspended');
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized('Invalid or expired token');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(res, error.message, error.statusCode);
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(res, 'Forbidden: Insufficient permissions', 403);
    }

    next();
  };
};
