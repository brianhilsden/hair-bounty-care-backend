import { Router } from 'express';
import { NewsletterController } from '../controllers/newsletter.controller';

const router = Router();
const newsletterController = new NewsletterController();

router.post('/subscribe', (req, res, next) => newsletterController.subscribe(req, res, next));

export default router;
