import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProgressPhotoSchema, updateProgressPhotoSchema } from '../validations/progress.validation';

const router = Router();
const progressController = new ProgressController();

// Progress photo routes
router.post(
  '/',
  authenticate,
  validate(createProgressPhotoSchema),
  progressController.createProgressPhoto.bind(progressController)
);

router.get(
  '/',
  authenticate,
  progressController.getUserProgressPhotos.bind(progressController)
);

router.get(
  '/stats',
  authenticate,
  progressController.getGrowthStats.bind(progressController)
);

router.get(
  '/comparison',
  authenticate,
  progressController.getBeforeAfterComparison.bind(progressController)
);

router.get(
  '/milestones',
  authenticate,
  progressController.getProgressMilestones.bind(progressController)
);

router.get(
  '/:id',
  authenticate,
  progressController.getProgressPhotoById.bind(progressController)
);

router.patch(
  '/:id',
  authenticate,
  validate(updateProgressPhotoSchema),
  progressController.updateProgressPhoto.bind(progressController)
);

router.delete(
  '/:id',
  authenticate,
  progressController.deleteProgressPhoto.bind(progressController)
);

export default router;
