import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new NotificationsController();

router.use(authenticate);
router.get('/',                        (req, res, next) => ctrl.getNotifications(req, res, next));
router.patch('/:id/read',              (req, res, next) => ctrl.markRead(req, res, next));
router.post('/read-all',               (req, res, next) => ctrl.markAllRead(req, res, next));
router.post('/register-token',         (req, res, next) => ctrl.registerPushToken(req, res, next));

export default router;
