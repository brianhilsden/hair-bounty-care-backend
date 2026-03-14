import { Router } from 'express';
import { RoutineController } from '../controllers/routine.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createRoutineTemplateSchema,
  updateRoutineTemplateSchema,
  logRoutineSchema,
  addUserRoutineSchema,
} from '../validations/routine.validation';

const router = Router();
const routineController = new RoutineController();

// Template routes (admin only for create/update/delete)
router.post(
  '/templates',
  authenticate,
  authorize('ADMIN'),
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
  authorize('ADMIN'),
  validate(updateRoutineTemplateSchema),
  routineController.updateTemplate.bind(routineController)
);

router.delete(
  '/templates/:id',
  authenticate,
  authorize('ADMIN'),
  routineController.deleteTemplate.bind(routineController)
);

// User routine selection (my-routines)
router.get(
  '/my-routines',
  authenticate,
  routineController.getUserRoutineTemplates.bind(routineController)
);

router.post(
  '/my-routines',
  authenticate,
  validate(addUserRoutineSchema),
  routineController.addUserRoutineTemplate.bind(routineController)
);

router.delete(
  '/my-routines/:templateId',
  authenticate,
  routineController.removeUserRoutineTemplate.bind(routineController)
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
