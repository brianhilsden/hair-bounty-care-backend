import { Router } from 'express';
import { SalonsController } from '../controllers/salons.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const salonsController = new SalonsController();

router.get('/', authenticate, (req, res, next) => salonsController.getSalons(req, res, next));
router.get('/nearby', authenticate, (req, res, next) => salonsController.getNearby(req, res, next));
router.get('/:id', authenticate, (req, res, next) => salonsController.getSalon(req, res, next));

export default router;
