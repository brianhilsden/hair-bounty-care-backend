import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '../validations/auth.validation';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data: RegisterInput = req.body;
      const result = await authService.register(data);

      return ApiResponse.created(
        res,
        result,
        'Registration successful! Please check your email to verify your account.'
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data: LoginInput = req.body;
      const result = await authService.login(data);

      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken }: RefreshTokenInput = req.body;
      const tokens = await authService.refreshToken(refreshToken);

      return ApiResponse.success(res, tokens, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);

      return ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data: ForgotPasswordInput = req.body;
      const result = await authService.forgotPassword(data);

      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data: ResetPasswordInput = req.body;
      const result = await authService.resetPassword(data);

      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token }: VerifyEmailInput = req.body;
      const result = await authService.verifyEmail(token);

      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }

  // GET /verify-email?token= — called by the care site after the user clicks the email link
  async verifyEmailGet(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string;
      if (!token) {
        return ApiResponse.error(res, 'Token is required', 400);
      }
      const result = await authService.verifyEmail(token);
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const user = await authService.getMe(req.user.userId);

      return ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
