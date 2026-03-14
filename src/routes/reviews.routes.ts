import { Router } from 'express';
import { ReviewsController } from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const reviewsController = new ReviewsController();

router.get('/', (req, res, next) => reviewsController.getReviews(req, res, next));
router.get('/:targetType/:targetId', (req, res, next) => reviewsController.getReviewsForTarget(req, res, next));
router.post('/', authenticate, (req, res, next) => reviewsController.createReview(req, res, next));

export default router;
