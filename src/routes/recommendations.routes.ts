import { Router } from 'express';
import { RecommendationsController } from '../controllers/recommendations.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new RecommendationsController();

router.use(authenticate);
router.get('/hairstyles', (req, res, next) => ctrl.getHairstyles(req, res, next));
router.get('/products',   (req, res, next) => ctrl.getProducts(req, res, next));
router.get('/diy',        (req, res, next) => ctrl.getDIYRecipes(req, res, next));

export default router;
