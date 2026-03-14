import { Router } from 'express';
import { OffersController } from '../controllers/offers.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new OffersController();

router.get('/',           (req, res, next) => ctrl.getActiveOffers(req, res, next));
router.post('/validate',  (req, res, next) => ctrl.validate(req, res, next));
router.post('/apply', authenticate, (req, res, next) => ctrl.apply(req, res, next));

export default router;
