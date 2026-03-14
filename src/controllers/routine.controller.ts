import { Request, Response, NextFunction } from 'express';
import { RoutineService } from '../services/routine.service';
import { ApiError } from '../utils/apiError';

const routineService = new RoutineService();

function param(val: string | string[]): string {
  return Array.isArray(val) ? val[0] : val;
}

export class RoutineController {
  async createTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await routineService.createTemplate(req.body);
      res.status(201).json({
        success: true,
        message: 'Routine template created successfully',
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await routineService.getTemplates();
      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTemplateById(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await routineService.getTemplateById(param(req.params.id));
      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await routineService.updateTemplate(param(req.params.id), req.body);
      res.json({
        success: true,
        message: 'Routine template updated successfully',
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      await routineService.deleteTemplate(param(req.params.id));
      res.json({
        success: true,
        message: 'Routine template deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async logRoutine(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const log = await routineService.logRoutine(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Routine logged successfully',
        data: log,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserLogs(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const { startDate, endDate, templateId, limit, offset } = req.query;

      const options: any = {};
      if (startDate) options.startDate = new Date(startDate as string);
      if (endDate) options.endDate = new Date(endDate as string);
      if (templateId) options.templateId = templateId as string;
      if (limit) options.limit = parseInt(limit as string);
      if (offset) options.offset = parseInt(offset as string);

      const result = await routineService.getUserLogs(userId, options);
      res.json({
        success: true,
        data: result.logs,
        meta: {
          total: result.total,
          limit: options.limit || 50,
          offset: options.offset || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTodayRoutines(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const routines = await routineService.getTodayRoutines(userId);
      res.json({
        success: true,
        data: routines,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoutineStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const stats = await routineService.getRoutineStats(userId);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStreak(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const streak = await routineService.getStreak(userId);
      res.json({
        success: true,
        data: streak,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserRoutineTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const result = await routineService.getUserRoutineTemplates(userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async addUserRoutineTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      const { templateId } = req.body;
      const record = await routineService.addUserRoutineTemplate(userId, templateId);
      res.status(201).json({
        success: true,
        message: 'Routine added to your list',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeUserRoutineTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('User not found');
      const userId = req.user.userId;
      await routineService.removeUserRoutineTemplate(userId, param(req.params.templateId));
      res.json({
        success: true,
        message: 'Routine removed from your list',
      });
    } catch (error) {
      next(error);
    }
  }
}
