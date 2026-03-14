import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
const uploadController = new UploadController();

// All routes require authentication
router.use(authenticate);

// Upload hair photo
router.post(
  '/hair-photo',
  upload.single('photo'),
  uploadController.uploadHairPhoto.bind(uploadController)
);

// Upload avatar
router.post(
  '/avatar',
  upload.single('avatar'),
  uploadController.uploadAvatar.bind(uploadController)
);

// Upload progress photo
router.post(
  '/progress-photo',
  upload.single('photo'),
  uploadController.uploadProgressPhoto.bind(uploadController)
);

export default router;
