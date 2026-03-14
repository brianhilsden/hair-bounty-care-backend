import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';
import { notificationsService } from './notifications.service';
import {
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  CreateOfferInput,
  UpdateOfferInput,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  CreateSalonInput,
  UpdateSalonInput,
  CreateAdInput,
  UpdateAdInput,
  CreateRoutineTemplateAdminInput,
  UpdateRoutineTemplateAdminInput,
} from '../validations/admin.validation';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export class AdminService {
  // ─── Stats ───────────────────────────────────────────────────────────────

  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      userCount,
      todayOrders,
      monthRevenue,
      productCount,
      blogPostCount,
      activeOfferCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: monthStart }, status: { not: 'cancelled' } },
        _sum: { totalAmount: true },
      }),
      prisma.product.count(),
      prisma.blogPost.count(),
      prisma.offer.count({ where: { isActive: true, validUntil: { gte: now } } }),
    ]);

    return {
      userCount,
      todayOrders,
      monthRevenue: monthRevenue._sum.totalAmount ?? 0,
      productCount,
      blogPostCount,
      activeOfferCount,
    };
  }

  async getRevenue(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: 'cancelled' } },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date string (YYYY-MM-DD)
    const grouped: Record<string, number> = {};
    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      grouped[dateKey] = (grouped[dateKey] ?? 0) + order.totalAmount;
    }

    return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
  }

  // ─── Orders ──────────────────────────────────────────────────────────────

  async getOrders(filters: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { status, search, page = 1, limit = 20 } = filters;
    const where: any = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: { include: { product: { select: { id: true, name: true, imageUrls: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOrder(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: { include: { product: { include: { category: true } } } },
      },
    });
    if (!order) throw ApiError.notFound('Order not found');
    return order;
  }

  async updateOrderStatus(id: string, status: string) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw ApiError.notFound('Order not found');
    const updated = await prisma.order.update({ where: { id }, data: { status } });

    if (status === 'shipped') {
      await notificationsService.sendToUser({
        userId: order.userId,
        title: '🚚 Your Order is on its Way!',
        body: `Your order is out for delivery. Get ready!`,
        type: 'order_shipped',
        data: { orderId: id },
      });
    }

    return updated;
  }

  // ─── Products ────────────────────────────────────────────────────────────

  async adminGetProducts(filters: {
    page?: number;
    limit?: number;
    categoryId?: string;
    productType?: string;
  } = {}) {
    const { page = 1, limit = 20, categoryId, productType } = filters;
    const where: any = {};

    if (categoryId) where.categoryId = categoryId;
    if (productType) where.productType = productType;

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createProduct(data: CreateProductInput) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        productType: data.productType,
        priceRange: data.priceRange,
        categoryId: data.categoryId,
        imageUrls: data.imageUrls ?? [],
        suitableFor: data.suitableFor ?? [],
        scalpTypes: data.scalpTypes ?? [],
        isEcoCertified: data.isEcoCertified ?? false,
        isZeroWaste: data.isZeroWaste ?? false,
        inStock: data.inStock ?? true,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        affiliateUrl: data.affiliateUrl,
      },
      include: { category: true },
    });
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw ApiError.notFound('Product not found');
    return prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw ApiError.notFound('Product not found');

    const orderCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderCount > 0) {
      // Soft delete: mark out of stock instead
      return prisma.product.update({ where: { id }, data: { inStock: false } });
    }
    return prisma.product.delete({ where: { id } });
  }

  async toggleStock(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw ApiError.notFound('Product not found');
    return prisma.product.update({ where: { id }, data: { inStock: !product.inStock } });
  }

  // ─── Categories ──────────────────────────────────────────────────────────

  async getCategories() {
    return prisma.productCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async createCategory(data: CreateCategoryInput) {
    return prisma.productCategory.create({ data });
  }

  // ─── Users ───────────────────────────────────────────────────────────────

  async getUsers(filters: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { role, search, page = 1, limit = 20 } = filters;
    const where: any = {};

    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
          isSuspended: true,
          isEmailVerified: true,
          isOnboarded: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        subscription: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { items: { include: { product: true } } },
        },
      },
    });
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  async updateUserRole(id: string, role: string, requestingUserId: string) {
    if (id === requestingUserId) throw ApiError.badRequest('Cannot change your own role');
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw ApiError.notFound('User not found');
    return prisma.user.update({ where: { id }, data: { role: role as any } });
  }

  async suspendUser(id: string, suspended: boolean, requestingUserId: string) {
    if (id === requestingUserId) throw ApiError.badRequest('Cannot suspend yourself');
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw ApiError.notFound('User not found');
    return prisma.user.update({ where: { id }, data: { isSuspended: suspended } });
  }

  // ─── Blog ─────────────────────────────────────────────────────────────────

  async adminGetPosts(filters: {
    published?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { published, page = 1, limit = 20 } = filters;
    const where: any = {};

    if (published === 'true') where.isPublished = true;
    else if (published === 'false') where.isPublished = false;

    const [posts, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return { posts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createPost(data: CreateBlogPostInput) {
    const slug = data.slug ?? generateSlug(data.title);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    return prisma.blogPost.create({
      data: {
        ...data,
        slug: finalSlug,
        publishedAt: data.isPublished ? new Date() : new Date(),
      },
    });
  }

  async updatePost(id: string, data: UpdateBlogPostInput) {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw ApiError.notFound('Blog post not found');
    return prisma.blogPost.update({ where: { id }, data });
  }

  async deletePost(id: string) {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw ApiError.notFound('Blog post not found');
    return prisma.blogPost.delete({ where: { id } });
  }

  async togglePublish(id: string) {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw ApiError.notFound('Blog post not found');
    return prisma.blogPost.update({
      where: { id },
      data: {
        isPublished: !post.isPublished,
        publishedAt: !post.isPublished ? new Date() : post.publishedAt,
      },
    });
  }

  // ─── Offers ───────────────────────────────────────────────────────────────

  async adminGetOffers() {
    return prisma.offer.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createOffer(data: CreateOfferInput) {
    return prisma.offer.create({
      data: {
        title: data.title,
        description: data.description,
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase,
        maxUses: data.maxUses,
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        isActive: true,
      },
    });
  }

  async updateOffer(id: string, data: UpdateOfferInput) {
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) throw ApiError.notFound('Offer not found');

    const updateData: any = { ...data };
    if (data.validFrom) updateData.validFrom = new Date(data.validFrom);
    if (data.validUntil) updateData.validUntil = new Date(data.validUntil);

    return prisma.offer.update({ where: { id }, data: updateData });
  }

  async deleteOffer(id: string) {
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) throw ApiError.notFound('Offer not found');
    return prisma.offer.delete({ where: { id } });
  }

  async toggleOffer(id: string) {
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) throw ApiError.notFound('Offer not found');
    return prisma.offer.update({ where: { id }, data: { isActive: !offer.isActive } });
  }

  // ─── Salons ───────────────────────────────────────────────────────────────

  async createSalon(data: CreateSalonInput) {
    return prisma.salon.create({ data });
  }

  async updateSalon(id: string, data: UpdateSalonInput) {
    const salon = await prisma.salon.findUnique({ where: { id } });
    if (!salon) throw ApiError.notFound('Salon not found');
    return prisma.salon.update({ where: { id }, data });
  }

  async deleteSalon(id: string) {
    const salon = await prisma.salon.findUnique({ where: { id } });
    if (!salon) throw ApiError.notFound('Salon not found');
    return prisma.salon.delete({ where: { id } });
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────

  async getReviews(filters: {
    status?: string;
    targetType?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { status, targetType, page = 1, limit = 20 } = filters;
    const where: any = {};

    if (status) where.status = status;
    if (targetType) where.targetType = targetType;

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateReviewStatus(id: string, status: string) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw ApiError.notFound('Review not found');
    return prisma.review.update({ where: { id }, data: { status } });
  }

  async deleteReview(id: string) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw ApiError.notFound('Review not found');
    return prisma.review.delete({ where: { id } });
  }

  // ─── Ads ──────────────────────────────────────────────────────────────────

  async adminGetAds() {
    return prisma.ad.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createAd(data: CreateAdInput) {
    return prisma.ad.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        targetUrl: data.targetUrl,
        placement: data.placement,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateAd(id: string, data: UpdateAdInput) {
    const ad = await prisma.ad.findUnique({ where: { id } });
    if (!ad) throw ApiError.notFound('Ad not found');

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    return prisma.ad.update({ where: { id }, data: updateData });
  }

  async deleteAd(id: string) {
    const ad = await prisma.ad.findUnique({ where: { id } });
    if (!ad) throw ApiError.notFound('Ad not found');
    return prisma.ad.delete({ where: { id } });
  }

  async toggleAd(id: string) {
    const ad = await prisma.ad.findUnique({ where: { id } });
    if (!ad) throw ApiError.notFound('Ad not found');
    return prisma.ad.update({ where: { id }, data: { isActive: !ad.isActive } });
  }

  // ─── Routine Templates ────────────────────────────────────────────────────

  async getRoutineTemplates() {
    return prisma.routineTemplate.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async createRoutineTemplate(data: CreateRoutineTemplateAdminInput) {
    return prisma.routineTemplate.create({ data });
  }

  async updateRoutineTemplate(id: string, data: UpdateRoutineTemplateAdminInput) {
    const template = await prisma.routineTemplate.findUnique({ where: { id } });
    if (!template) throw ApiError.notFound('Routine template not found');
    return prisma.routineTemplate.update({ where: { id }, data });
  }

  async deleteRoutineTemplate(id: string) {
    const template = await prisma.routineTemplate.findUnique({ where: { id } });
    if (!template) throw ApiError.notFound('Routine template not found');

    // Check if any logs reference this template
    const logCount = await prisma.routineLog.count({ where: { templateId: id } });
    if (logCount > 0) {
      // Soft delete: deactivate instead
      return prisma.routineTemplate.update({ where: { id }, data: { isActive: false } });
    }
    return prisma.routineTemplate.delete({ where: { id } });
  }

  async toggleRoutineActive(id: string) {
    const template = await prisma.routineTemplate.findUnique({ where: { id } });
    if (!template) throw ApiError.notFound('Routine template not found');
    return prisma.routineTemplate.update({ where: { id }, data: { isActive: !template.isActive } });
  }

  // ─── Newsletter & Push ───────────────────────────────────────────────

  async getSubscribers() {
    return prisma.newsletterSubscription.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, createdAt: true },
    });
  }

  async sendPush({ title, body, target }: { title: string; body: string; target: string }) {
    // Build filter based on target segment
    const where: any = { pushToken: { not: null }, isSuspended: false };
    if (target === 'trial') {
      where.subscription = { status: 'TRIAL' };
    } else if (target === 'monthly') {
      where.subscription = { plan: 'MONTHLY', status: 'ACTIVE' };
    } else if (target === 'annual') {
      where.subscription = { plan: 'ANNUAL', status: 'ACTIVE' };
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true, pushToken: true },
    });

    // Log a notification record for each user (actual push delivery handled by mobile app/FCM)
    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title,
        body,
        type: 'system',
      })),
      skipDuplicates: true,
    });

    return { sent: users.length, title, body, target };
  }
}
