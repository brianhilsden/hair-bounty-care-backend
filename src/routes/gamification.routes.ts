import { Router } from 'express';
import { GamificationController } from '../controllers/gamification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const gamificationController = new GamificationController();

// Badge routes
router.get(
  '/badges',
  authenticate,
  gamificationController.getAllBadges.bind(gamificationController)
);

router.get(
  '/badges/me',
  authenticate,
  gamificationController.getUserBadges.bind(gamificationController)
);

router.post(
  '/badges/check',
  authenticate,
  gamificationController.checkBadges.bind(gamificationController)
);

// Leaderboard routes
router.get(
  '/leaderboard',
  authenticate,
  gamificationController.getLeaderboard.bind(gamificationController)
);

router.get(
  '/leaderboard/me',
  authenticate,
  gamificationController.getUserRank.bind(gamificationController)
);

export default router;
