import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { env } from '../config/env';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      return ApiResponse.error(res, 'A record with this value already exists', 409);
    }
    if (prismaError.code === 'P2025') {
      return ApiResponse.error(res, 'Record not found', 404);
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token expired', 401);
  }

  // Log unexpected errors
  console.error('❌ Unexpected error:', err);

  // Return generic error in production
  const message = env.NODE_ENV === 'development' ? err.message : 'Internal server error';
  return ApiResponse.error(res, message, 500);
};

export const notFoundHandler = (req: Request, res: Response) => {
  return ApiResponse.error(res, `Route ${req.originalUrl} not found`, 404);
};
