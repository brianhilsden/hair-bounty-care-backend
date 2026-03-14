import { Router } from 'express';
import { AdsController } from '../controllers/ads.controller';

const router = Router();
const ctrl = new AdsController();

router.get('/:placement',  (req, res, next) => ctrl.getAd(req, res, next));
router.post('/:id/click',  (req, res, next) => ctrl.trackClick(req, res, next));

export default router;
