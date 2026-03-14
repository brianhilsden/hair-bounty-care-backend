import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';

export interface ProductFilters {
  categoryId?: string;
  productType?: string;
  priceRange?: string;
  isEcoCertified?: boolean;
  isZeroWaste?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export class ProductsService {
  async getCategories() {
    return await prisma.productCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async getProducts(filters: ProductFilters = {}) {
    const {
      categoryId, productType, priceRange, isEcoCertified,
      isZeroWaste, search, page = 1, limit = 20,
    } = filters;

    const where: any = { inStock: true };

    if (categoryId) where.categoryId = categoryId;
    if (productType) where.productType = productType;
    if (priceRange) where.priceRange = priceRange;
    if (isEcoCertified) where.isEcoCertified = true;
    if (isZeroWaste) where.isZeroWaste = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: [{ rating: 'desc' }],
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  }

  async createOrder(userId: string, data: {
    items: { productId: string; quantity: number }[];
    deliveryAddress: string;
    deliveryNotes?: string;
    paymentMethod: string;
    paymentRef?: string;
  }) {
    // Fetch all products to get prices
    const productIds = data.items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw ApiError.badRequest('One or more products not found');
    }

    const productMap = new Map(products.map(p => [p.id, p]));

    // Validate stock & calculate total
    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product?.inStock) {
        throw ApiError.badRequest(`Product "${product?.name}" is out of stock`);
      }
    }

    const totalAmount = data.items.reduce((sum, item) => {
      const product = productMap.get(item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        deliveryAddress: data.deliveryAddress,
        deliveryNotes: data.deliveryNotes,
        paymentMethod: data.paymentMethod,
        paymentRef: data.paymentRef,
        status: 'pending',
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productMap.get(item.productId)!.price,
          })),
        },
      },
      include: {
        items: {
          include: { product: { include: { category: true } } },
        },
      },
    });

    return order;
  }

  async getOrders(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(id: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: { include: { product: { include: { category: true } } } },
      },
    });
    if (!order) throw ApiError.notFound('Order not found');
    return order;
  }
}
