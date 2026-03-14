import { Request, Response, NextFunction } from 'express';
import { ProductsService } from '../services/products.service';
import { ApiResponse } from '../utils/apiResponse';

const productsService = new ProductsService();

export class ProductsController {
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await productsService.getCategories();
      return ApiResponse.success(res, categories);
    } catch (error) { next(error); }
  }

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        categoryId, productType, priceRange,
        isEcoCertified, isZeroWaste, search, page, limit,
      } = req.query;

      const result = await productsService.getProducts({
        categoryId: categoryId as string,
        productType: productType as string,
        priceRange: priceRange as string,
        isEcoCertified: isEcoCertified === 'true',
        isZeroWaste: isZeroWaste === 'true',
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      return ApiResponse.success(res, result.products, 'Success', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) { next(error); }
  }

  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productsService.getProduct(req.params.id as string);
      return ApiResponse.success(res, product);
    } catch (error) { next(error); }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { items, deliveryAddress, deliveryNotes, paymentMethod, paymentRef } = req.body;
      const order = await productsService.createOrder(userId, {
        items, deliveryAddress, deliveryNotes, paymentMethod, paymentRef,
      });
      return ApiResponse.created(res, order, 'Order placed successfully');
    } catch (error) { next(error); }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await productsService.getOrders(req.user!.userId);
      return ApiResponse.success(res, orders);
    } catch (error) { next(error); }
  }

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await productsService.getOrder(req.params.id as string, req.user!.userId);
      return ApiResponse.success(res, order);
    } catch (error) { next(error); }
  }
}
