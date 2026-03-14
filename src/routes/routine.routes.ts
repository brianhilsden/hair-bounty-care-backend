import { Router } from 'express';
import { RoutineController } from '../controllers/routine.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createRoutineTemplateSchema, updateRoutineTemplateSchema, logRoutineSchema } from '../validations/routine.validation';

const router = Router();
const routineController = new RoutineController();

// Template routes (admin only for create/update/delete - would need admin middleware)
router.post(
  '/templates',
  authenticate,
  validate(createRoutineTemplateSchema),
  routineController.createTemplate.bind(routineController)
);

router.get(
  '/templates',
  authenticate,
  routineController.getTemplates.bind(routineController)
);

router.get(
  '/templates/:id',
  authenticate,
  routineController.getTemplateById.bind(routineController)
);

router.patch(
  '/templates/:id',
  authenticate,
  validate(updateRoutineTemplateSchema),
  routineController.updateTemplate.bind(routineController)
);

router.delete(
  '/templates/:id',
  authenticate,
  routineController.deleteTemplate.bind(routineController)
);

// User routine logging routes
router.post(
  '/log',
  authenticate,
  validate(logRoutineSchema),
  routineController.logRoutine.bind(routineController)
);

router.get(
  '/logs',
  authenticate,
  routineController.getUserLogs.bind(routineController)
);

router.get(
  '/today',
  authenticate,
  routineController.getTodayRoutines.bind(routineController)
);

router.get(
  '/stats',
  authenticate,
  routineController.getRoutineStats.bind(routineController)
);

router.get(
  '/streak',
  authenticate,
  routineController.getStreak.bind(routineController)
);

export default router;
