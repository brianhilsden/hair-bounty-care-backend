import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { adminMutationRateLimiter } from '../middleware/rateLimiter';
import {
  updateOrderStatusSchema,
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  createBlogPostSchema,
  updateBlogPostSchema,
  createOfferSchema,
  updateOfferSchema,
  createSalonSchema,
  updateSalonSchema,
  updateUserRoleSchema,
  createAdSchema,
  updateAdSchema,
  updateReviewStatusSchema,
} from '../validations/admin.validation';

const router = Router();
const ctrl = new AdminController();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

// ─── Stats ────────────────────────────────────────────────────────────────────
router.get('/stats', ctrl.getStats.bind(ctrl));
router.get('/revenue', ctrl.getRevenue.bind(ctrl));

// ─── Orders ───────────────────────────────────────────────────────────────────
router.get('/orders', ctrl.getOrders.bind(ctrl));
router.get('/orders/:id', ctrl.getOrder.bind(ctrl));
router.patch('/orders/:id/status',
  adminMutationRateLimiter,
  validate(updateOrderStatusSchema),
  ctrl.updateOrderStatus.bind(ctrl)
);

// ─── Products ─────────────────────────────────────────────────────────────────
router.get('/products', ctrl.getProducts.bind(ctrl));
router.post('/products',
  adminMutationRateLimiter,
  validate(createProductSchema),
  ctrl.createProduct.bind(ctrl)
);
router.put('/products/:id',
  adminMutationRateLimiter,
  validate(updateProductSchema),
  ctrl.updateProduct.bind(ctrl)
);
router.delete('/products/:id', adminMutationRateLimiter, ctrl.deleteProduct.bind(ctrl));
router.patch('/products/:id/stock', adminMutationRateLimiter, ctrl.toggleStock.bind(ctrl));

// ─── Categories ───────────────────────────────────────────────────────────────
router.get('/categories', ctrl.getCategories.bind(ctrl));
router.post('/categories',
  adminMutationRateLimiter,
  validate(createCategorySchema),
  ctrl.createCategory.bind(ctrl)
);

// ─── Users ────────────────────────────────────────────────────────────────────
router.get('/users', ctrl.getUsers.bind(ctrl));
router.get('/users/:id', ctrl.getUser.bind(ctrl));
router.patch('/users/:id/role',
  adminMutationRateLimiter,
  validate(updateUserRoleSchema),
  ctrl.updateUserRole.bind(ctrl)
);
router.patch('/users/:id/suspend', adminMutationRateLimiter, ctrl.suspendUser.bind(ctrl));

// ─── Blog ─────────────────────────────────────────────────────────────────────
router.get('/blog', ctrl.getBlogPosts.bind(ctrl));
router.post('/blog',
  adminMutationRateLimiter,
  validate(createBlogPostSchema),
  ctrl.createBlogPost.bind(ctrl)
);
router.put('/blog/:id',
  adminMutationRateLimiter,
  validate(updateBlogPostSchema),
  ctrl.updateBlogPost.bind(ctrl)
);
router.delete('/blog/:id', adminMutationRateLimiter, ctrl.deleteBlogPost.bind(ctrl));
router.patch('/blog/:id/publish', adminMutationRateLimiter, ctrl.togglePublish.bind(ctrl));

// ─── Offers ───────────────────────────────────────────────────────────────────
router.get('/offers', ctrl.getOffers.bind(ctrl));
router.post('/offers',
  adminMutationRateLimiter,
  validate(createOfferSchema),
  ctrl.createOffer.bind(ctrl)
);
router.put('/offers/:id',
  adminMutationRateLimiter,
  validate(updateOfferSchema),
  ctrl.updateOffer.bind(ctrl)
);
router.delete('/offers/:id', adminMutationRateLimiter, ctrl.deleteOffer.bind(ctrl));
router.patch('/offers/:id/toggle', adminMutationRateLimiter, ctrl.toggleOffer.bind(ctrl));

// ─── Salons ───────────────────────────────────────────────────────────────────
router.post('/salons',
  adminMutationRateLimiter,
  validate(createSalonSchema),
  ctrl.createSalon.bind(ctrl)
);
router.put('/salons/:id',
  adminMutationRateLimiter,
  validate(updateSalonSchema),
  ctrl.updateSalon.bind(ctrl)
);
router.delete('/salons/:id', adminMutationRateLimiter, ctrl.deleteSalon.bind(ctrl));

// ─── Reviews ──────────────────────────────────────────────────────────────────
router.get('/reviews', ctrl.getReviews.bind(ctrl));
router.patch('/reviews/:id/status',
  adminMutationRateLimiter,
  validate(updateReviewStatusSchema),
  ctrl.updateReviewStatus.bind(ctrl)
);
router.delete('/reviews/:id', adminMutationRateLimiter, ctrl.deleteReview.bind(ctrl));

// ─── Newsletter & Push ───────────────────────────────────────────────────────
router.get('/subscribers', ctrl.getSubscribers.bind(ctrl));
router.post('/push', adminMutationRateLimiter, ctrl.sendPush.bind(ctrl));

// ─── Ads ──────────────────────────────────────────────────────────────────────
router.get('/ads', ctrl.getAds.bind(ctrl));
router.post('/ads',
  adminMutationRateLimiter,
  validate(createAdSchema),
  ctrl.createAd.bind(ctrl)
);
router.put('/ads/:id',
  adminMutationRateLimiter,
  validate(updateAdSchema),
  ctrl.updateAd.bind(ctrl)
);
router.delete('/ads/:id', adminMutationRateLimiter, ctrl.deleteAd.bind(ctrl));
router.patch('/ads/:id/toggle', adminMutationRateLimiter, ctrl.toggleAd.bind(ctrl));

export default router;
