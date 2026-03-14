import { Request, Response, NextFunction } from 'express';
import { CommunityService } from '../services/community.service';
import { ApiResponse } from '../utils/apiResponse';

const communityService = new CommunityService();

export class CommunityController {
  // ─── Groups ────────────────────────────────────────────────

  async getGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const groups = await communityService.getGroups(userId);
      return ApiResponse.success(res, groups);
    } catch (error) { next(error); }
  }

  async getGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const group = await communityService.getGroup(id, userId);
      return ApiResponse.success(res, group);
    } catch (error) { next(error); }
  }

  async joinGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const result = await communityService.joinGroup(id, userId);
      return ApiResponse.success(res, result, 'Joined group');
    } catch (error) { next(error); }
  }

  async leaveGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const result = await communityService.leaveGroup(id, userId);
      return ApiResponse.success(res, result, 'Left group');
    } catch (error) { next(error); }
  }

  // ─── Posts ─────────────────────────────────────────────────

  async getGroupPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const posts = await communityService.getGroupPosts(id, userId);
      return ApiResponse.success(res, posts);
    } catch (error) { next(error); }
  }

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const { content, imageUrls } = req.body;
      const post = await communityService.createPost(id, userId, { content, imageUrls });
      return ApiResponse.created(res, post, 'Post created');
    } catch (error) { next(error); }
  }

  async likePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const postId = req.params.postId as string;
      const result = await communityService.likePost(postId, userId);
      return ApiResponse.success(res, result, 'Post liked');
    } catch (error) { next(error); }
  }

  // ─── Chat ──────────────────────────────────────────────────

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { page, limit } = req.query;
      const messages = await communityService.getMessages(id, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      return ApiResponse.success(res, messages);
    } catch (error) { next(error); }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const { content, imageUrl } = req.body;
      const message = await communityService.sendMessage(id, userId, content, imageUrl);
      return ApiResponse.created(res, message, 'Message sent');
    } catch (error) { next(error); }
  }
}
