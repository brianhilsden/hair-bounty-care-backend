import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import uploadRoutes from './upload.routes';
import routineRoutes from './routine.routes';
import gamificationRoutes from './gamification.routes';
import progressRoutes from './progress.routes';
import communityRoutes from './community.routes';
import reviewsRoutes from './reviews.routes';
import referralsRoutes from './referrals.routes';
import salonsRoutes from './salons.routes';
import productsRoutes from './products.routes';
import blogRoutes from './blog.routes';
import promosRoutes from './promos.routes';
import newsletterRoutes from './newsletter.routes';
import recommendationsRoutes from './recommendations.routes';
import notificationsRoutes from './notifications.routes';
import adsRoutes from './ads.routes';
import offersRoutes from './offers.routes';
import adminRoutes from './admin.routes';
import aiRoutes from './ai.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hair Bounty Care API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/upload', uploadRoutes);
router.use('/routines', routineRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/progress', progressRoutes);
router.use('/community', communityRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/referrals', referralsRoutes);
router.use('/salons', salonsRoutes);
router.use('/products', productsRoutes);
router.use('/blog', blogRoutes);
router.use('/promos', promosRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/recommendations', recommendationsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/ads', adsRoutes);
router.use('/offers', offersRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);

export default router;
