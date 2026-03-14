import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../utils/apiResponse';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return ApiResponse.error(res, 'Validation failed', 400, errors);
      }
      next(error);
    }
  };
};
