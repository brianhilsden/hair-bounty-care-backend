import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { ApiResponse } from '../utils/apiResponse';

const adminService = new AdminService();

function qs(val: unknown): string | undefined {
  if (typeof val === 'string' && val.length > 0) return val;
  return undefined;
}

function param(val: string | string[]): string {
  return Array.isArray(val) ? val[0] : val;
}

export class AdminController {
  // ─── Stats ───────────────────────────────────────────────────────────────

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getStats();
      return ApiResponse.success(res, stats);
    } catch (e) { next(e); }
  }

  async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await adminService.getRevenue(days);
      return ApiResponse.success(res, data);
    } catch (e) { next(e); }
  }

  // ─── Orders ──────────────────────────────────────────────────────────────

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = qs(req.query.status);
      const search = qs(req.query.search);
      const result = await adminService.getOrders({ status, search, page, limit });
      return ApiResponse.success(res, result.orders, 'Success', 200, {
        page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
      });
    } catch (e) { next(e); }
  }

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await adminService.getOrder(param(req.params.id));
      return ApiResponse.success(res, order);
    } catch (e) { next(e); }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await adminService.updateOrderStatus(param(req.params.id), req.body.status);
      return ApiResponse.success(res, order, 'Order status updated');
    } catch (e) { next(e); }
  }

  // ─── Products ────────────────────────────────────────────────────────────

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const categoryId = qs(req.query.categoryId);
      const productType = qs(req.query.productType);
      const result = await adminService.adminGetProducts({ page, limit, categoryId, productType });
      return ApiResponse.success(res, result.products, 'Success', 200, {
        page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
      });
    } catch (e) { next(e); }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await adminService.createProduct(req.body);
      return ApiResponse.created(res, product, 'Product created');
    } catch (e) { next(e); }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await adminService.updateProduct(param(req.params.id), req.body);
      return ApiResponse.success(res, product, 'Product updated');
    } catch (e) { next(e); }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteProduct(param(req.params.id));
      return ApiResponse.success(res, null, 'Product deleted');
    } catch (e) { next(e); }
  }

  async toggleStock(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await adminService.toggleStock(param(req.params.id));
      return ApiResponse.success(res, product, 'Stock toggled');
    } catch (e) { next(e); }
  }

  // ─── Categories ──────────────────────────────────────────────────────────

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await adminService.getCategories();
      return ApiResponse.success(res, categories);
    } catch (e) { next(e); }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await adminService.createCategory(req.body);
      return ApiResponse.created(res, category, 'Category created');
    } catch (e) { next(e); }
  }

  // ─── Users ───────────────────────────────────────────────────────────────

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const role = qs(req.query.role);
      const search = qs(req.query.search);
      const result = await adminService.getUsers({ role, search, page, limit });
      return ApiResponse.success(res, result.users, 'Success', 200, {
        page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
      });
    } catch (e) { next(e); }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminService.getUser(param(req.params.id));
      return ApiResponse.success(res, user);
    } catch (e) { next(e); }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminService.updateUserRole(param(req.params.id), req.body.role, req.user!.userId);
      return ApiResponse.success(res, user, 'User role updated');
    } catch (e) { next(e); }
  }

  async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const suspended = req.body.suspended !== false;
      const user = await adminService.suspendUser(param(req.params.id), suspended, req.user!.userId);
      return ApiResponse.success(res, user, suspended ? 'User suspended' : 'User unsuspended');
    } catch (e) { next(e); }
  }

  // ─── Blog ─────────────────────────────────────────────────────────────────

  async getBlogPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const published = qs(req.query.published);
      const result = await adminService.adminGetPosts({ published, page, limit });
      return ApiResponse.success(res, result.posts, 'Success', 200, {
        page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
      });
    } catch (e) { next(e); }
  }

  async createBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await adminService.createPost(req.body);
      return ApiResponse.created(res, post, 'Blog post created');
    } catch (e) { next(e); }
  }

  async updateBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await adminService.updatePost(param(req.params.id), req.body);
      return ApiResponse.success(res, post, 'Blog post updated');
    } catch (e) { next(e); }
  }

  async deleteBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deletePost(param(req.params.id));
      return ApiResponse.success(res, null, 'Blog post deleted');
    } catch (e) { next(e); }
  }

  async togglePublish(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await adminService.togglePublish(param(req.params.id));
      return ApiResponse.success(res, post, 'Publish status toggled');
    } catch (e) { next(e); }
  }

  // ─── Offers ───────────────────────────────────────────────────────────────

  async getOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const offers = await adminService.adminGetOffers();
      return ApiResponse.success(res, offers);
    } catch (e) { next(e); }
  }

  async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await adminService.createOffer(req.body);
      return ApiResponse.created(res, offer, 'Offer created');
    } catch (e) { next(e); }
  }

  async updateOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await adminService.updateOffer(param(req.params.id), req.body);
      return ApiResponse.success(res, offer, 'Offer updated');
    } catch (e) { next(e); }
  }

  async deleteOffer(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteOffer(param(req.params.id));
      return ApiResponse.success(res, null, 'Offer deleted');
    } catch (e) { next(e); }
  }

  async toggleOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await adminService.toggleOffer(param(req.params.id));
      return ApiResponse.success(res, offer, 'Offer toggled');
    } catch (e) { next(e); }
  }

  // ─── Salons ───────────────────────────────────────────────────────────────

  async createSalon(req: Request, res: Response, next: NextFunction) {
    try {
      const salon = await adminService.createSalon(req.body);
      return ApiResponse.created(res, salon, 'Salon created');
    } catch (e) { next(e); }
  }

  async updateSalon(req: Request, res: Response, next: NextFunction) {
    try {
      const salon = await adminService.updateSalon(param(req.params.id), req.body);
      return ApiResponse.success(res, salon, 'Salon updated');
    } catch (e) { next(e); }
  }

  async deleteSalon(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteSalon(param(req.params.id));
      return ApiResponse.success(res, null, 'Salon deleted');
    } catch (e) { next(e); }
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────

  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = qs(req.query.status);
      const targetType = qs(req.query.type);
      const result = await adminService.getReviews({ status, targetType, page, limit });
      return ApiResponse.success(res, result.reviews, 'Success', 200, {
        page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
      });
    } catch (e) { next(e); }
  }

  async updateReviewStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await adminService.updateReviewStatus(param(req.params.id), req.body.status);
      return ApiResponse.success(res, review, 'Review status updated');
    } catch (e) { next(e); }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteReview(param(req.params.id));
      return ApiResponse.success(res, null, 'Review deleted');
    } catch (e) { next(e); }
  }

  // ─── Ads ──────────────────────────────────────────────────────────────────

  async getAds(req: Request, res: Response, next: NextFunction) {
    try {
      const ads = await adminService.adminGetAds();
      return ApiResponse.success(res, ads);
    } catch (e) { next(e); }
  }

  async createAd(req: Request, res: Response, next: NextFunction) {
    try {
      const ad = await adminService.createAd(req.body);
      return ApiResponse.created(res, ad, 'Ad created');
    } catch (e) { next(e); }
  }

  async updateAd(req: Request, res: Response, next: NextFunction) {
    try {
      const ad = await adminService.updateAd(param(req.params.id), req.body);
      return ApiResponse.success(res, ad, 'Ad updated');
    } catch (e) { next(e); }
  }

  async deleteAd(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteAd(param(req.params.id));
      return ApiResponse.success(res, null, 'Ad deleted');
    } catch (e) { next(e); }
  }

  async toggleAd(req: Request, res: Response, next: NextFunction) {
    try {
      const ad = await adminService.toggleAd(param(req.params.id));
      return ApiResponse.success(res, ad, 'Ad toggled');
    } catch (e) { next(e); }
  }

  // ─── Routine Templates ────────────────────────────────────────────────

  async getRoutineTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await adminService.getRoutineTemplates();
      return ApiResponse.success(res, templates);
    } catch (e) { next(e); }
  }

  async createRoutineTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await adminService.createRoutineTemplate(req.body);
      return ApiResponse.created(res, template, 'Routine template created');
    } catch (e) { next(e); }
  }

  async updateRoutineTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await adminService.updateRoutineTemplate(param(req.params.id), req.body);
      return ApiResponse.success(res, template, 'Routine template updated');
    } catch (e) { next(e); }
  }

  async deleteRoutineTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.deleteRoutineTemplate(param(req.params.id));
      return ApiResponse.success(res, result, 'Routine template deleted');
    } catch (e) { next(e); }
  }

  async toggleRoutineActive(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await adminService.toggleRoutineActive(param(req.params.id));
      return ApiResponse.success(res, template, 'Routine active status toggled');
    } catch (e) { next(e); }
  }

  // ─── Newsletter & Push ────────────────────────────────────────────────

  async getSubscribers(req: Request, res: Response, next: NextFunction) {
    try {
      const subscribers = await adminService.getSubscribers();
      return ApiResponse.success(res, subscribers);
    } catch (e) { next(e); }
  }

  async sendPush(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, body, target } = req.body;
      if (!title || !body) {
        return ApiResponse.error(res, 'title and body are required', 400);
      }
      const result = await adminService.sendPush({ title, body, target: target ?? 'all' });
      return ApiResponse.success(res, result, 'Push notification queued');
    } catch (e) { next(e); }
  }
}
