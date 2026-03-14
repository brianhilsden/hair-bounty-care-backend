import { Router } from 'express';
import { ReferralsController } from '../controllers/referrals.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const referralsController = new ReferralsController();

router.use(authenticate);

router.get('/', (req, res, next) => referralsController.getStats(req, res, next));
router.get('/code', (req, res, next) => referralsController.getCode(req, res, next));
router.post('/validate', (req, res, next) => referralsController.validate(req, res, next));

export default router;
