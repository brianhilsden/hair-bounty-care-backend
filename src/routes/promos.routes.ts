import { Router } from 'express';
import { PromosController } from '../controllers/promos.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const promosController = new PromosController();

router.post('/validate', authenticate, (req, res, next) => promosController.validatePromo(req, res, next));

export default router;
