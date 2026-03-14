import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import {
  getChatResponse,
  getConversations,
  getConversation,
  deleteConversation,
  ChatMessage,
} from '../services/ai.service';

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { messages, conversationId } = req.body as {
      messages: ChatMessage[];
      conversationId?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw ApiError.badRequest('messages array is required');
    }

    const result = await getChatResponse(userId, messages, conversationId);
    return ApiResponse.success(res, result, 'OK');
  } catch (error) {
    next(error);
  }
};

export const listConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const conversations = await getConversations(userId);
    return ApiResponse.success(res, conversations, 'OK');
  } catch (error) {
    next(error);
  }
};

export const getOneConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const conversationId = req.params.id as string;
    const conversation = await getConversation(userId, conversationId);
    return ApiResponse.success(res, conversation, 'OK');
  } catch (error) {
    next(error);
  }
};

export const removeConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const conversationId = req.params.id as string;
    await deleteConversation(userId, conversationId);
    return ApiResponse.success(res, null, 'Conversation deleted');
  } catch (error) {
    next(error);
  }
};
