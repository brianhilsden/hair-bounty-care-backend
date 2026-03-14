import { z } from 'zod';

// ─── Orders ──────────────────────────────────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// ─── Products ────────────────────────────────────────────────────────────────

const curlPatterns = [
  'TYPE_1A', 'TYPE_1B', 'TYPE_1C',
  'TYPE_2A', 'TYPE_2B', 'TYPE_2C',
  'TYPE_3A', 'TYPE_3B', 'TYPE_3C',
  'TYPE_4A', 'TYPE_4B', 'TYPE_4C',
] as const;

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  productType: z.enum(['DIY_INGREDIENT', 'READY_MADE', 'HAIR_BOUNTY_OWN']),
  priceRange: z.enum(['BUDGET', 'MID_RANGE', 'PREMIUM']),
  categoryId: z.string().min(1),
  imageUrls: z.array(z.string()).default([]),
  suitableFor: z.array(z.enum(curlPatterns)).default([]),
  scalpTypes: z.array(z.string()).default([]),
  isEcoCertified: z.boolean().default(false),
  isZeroWaste: z.boolean().default(false),
  inStock: z.boolean().default(true),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),
  affiliateUrl: z.string().optional().nullable(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ─── Categories ──────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1),
  iconUrl: z.string().url().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// ─── Offers ──────────────────────────────────────────────────────────────────

export const createOfferSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  code: z.string().min(1).transform((v) => v.toUpperCase()).optional().nullable(),
  discountType: z.enum(['percentage', 'fixed_amount', 'package']),
  discountValue: z.number().positive(),
  minPurchase: z.number().positive().optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const updateOfferSchema = createOfferSchema.partial();
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;

// ─── Blog ─────────────────────────────────────────────────────────────────────

export const createBlogPostSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverUrl: z.string().url(),
  author: z.string().min(1),
  authorAvatar: z.string().url().optional().nullable(),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  readTime: z.number().int().positive(),
  isPublished: z.boolean().default(false),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;

export const updateBlogPostSchema = createBlogPostSchema.partial();
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;

// ─── Salons ───────────────────────────────────────────────────────────────────

export const createSalonSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  imageUrls: z.array(z.string()).default([]),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  isHighEnd: z.boolean().default(false),
  isBudget: z.boolean().default(false),
  isKidsFriendly: z.boolean().default(false),
  isOrganic: z.boolean().default(false),
  isGreenCertified: z.boolean().default(false),
  specialties: z.array(z.string()).default([]),
  isAffiliate: z.boolean().default(false),
});

export type CreateSalonInput = z.infer<typeof createSalonSchema>;

export const updateSalonSchema = createSalonSchema.partial();
export type UpdateSalonInput = z.infer<typeof updateSalonSchema>;

// ─── Users ────────────────────────────────────────────────────────────────────

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

// ─── Ads ──────────────────────────────────────────────────────────────────────

export const createAdSchema = z.object({
  title: z.string().min(1),
  imageUrl: z.string().url(),
  targetUrl: z.string().url(),
  placement: z.enum(['home_banner', 'explore_banner', 'product_sponsored']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().default(true),
});

export type CreateAdInput = z.infer<typeof createAdSchema>;

export const updateAdSchema = createAdSchema.partial();
export type UpdateAdInput = z.infer<typeof updateAdSchema>;

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const updateReviewStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

export type UpdateReviewStatusInput = z.infer<typeof updateReviewStatusSchema>;

// ─── Routine Templates ────────────────────────────────────────────────────────

export const createRoutineTemplateAdminSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().min(1),
  description: z.string().min(1).max(500),
  category: z.string().min(1).max(50),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  targetHairTypes: z.array(z.string()).default([]),
  targetPorosities: z.array(z.string()).default([]),
  targetGoals: z.array(z.string()).default([]),
  estimatedMinutes: z.number().int().min(1).max(240).default(5),
});

export type CreateRoutineTemplateAdminInput = z.infer<typeof createRoutineTemplateAdminSchema>;

export const updateRoutineTemplateAdminSchema = createRoutineTemplateAdminSchema.partial();
export type UpdateRoutineTemplateAdminInput = z.infer<typeof updateRoutineTemplateAdminSchema>;
