import { Request, Response, NextFunction } from 'express';
import { BlogService } from '../services/blog.service';
import { ApiResponse } from '../utils/apiResponse';

const blogService = new BlogService();

export class BlogController {
  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, page, limit } = req.query;
      const result = await blogService.getPosts({
        category: category as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      return ApiResponse.success(res, result.posts, 'Success', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) { next(error); }
  }

  async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await blogService.getPost(req.params.slug as string);
      return ApiResponse.success(res, post);
    } catch (error) { next(error); }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await blogService.getCategories();
      return ApiResponse.success(res, categories);
    } catch (error) { next(error); }
  }
}
