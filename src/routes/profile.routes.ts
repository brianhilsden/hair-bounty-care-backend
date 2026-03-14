import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { createHairProfileSchema, updateHairProfileSchema } from '../validations/profile.validation';

const router = Router();
const profileController = new ProfileController();

// All routes require authentication
router.use(authenticate);

// Get hair type definitions (for quiz)
router.get('/definitions', profileController.getHairTypeDefinitions.bind(profileController));

// Profile CRUD
router.post(
  '/',
  validate(createHairProfileSchema),
  profileController.createProfile.bind(profileController)
);

router.get('/', profileController.getProfile.bind(profileController));

router.patch(
  '/',
  validate(updateHairProfileSchema),
  profileController.updateProfile.bind(profileController)
);

router.delete('/', profileController.deleteProfile.bind(profileController));

export default router;
