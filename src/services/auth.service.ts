import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';
import { notificationsService } from './notifications.service';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { generateReferralCode, generateToken, sanitizeUser } from '../utils/helpers';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../utils/email';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validations/auth.validation';

export class AuthService {
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    // Validate referral code if provided
    if (data.referredBy) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: data.referredBy },
      });
      if (!referrer) {
        throw ApiError.badRequest('Invalid referral code');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        referralCode: generateReferralCode(data.email),
        referredBy: data.referredBy || null,
      },
    });

    // Create 7-day free trial subscription
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'FREE_TRIAL',
        status: 'TRIAL',
        startDate: new Date(),
        endDate: trialEndDate,
      },
    });

    // Create streak record
    await prisma.streak.create({
      data: {
        userId: user.id,
        currentStreak: 0,
        longestStreak: 0,
      },
    });

    // Create referral record if referred
    if (data.referredBy) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: data.referredBy },
      });
      if (referrer) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: user.id,
          },
        });
        await notificationsService.sendToUser({
          userId: referrer.id,
          title: '🔔 Referral Joined!',
          body: `${user.firstName} just joined Hair Bounty using your referral code!`,
          type: 'referral_joined',
          data: { referredUserId: user.id },
        });
      }
    }

    // Store email verification token (24h expiry)
    const verificationToken = generateToken();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24);
    await prisma.emailVerificationToken.create({
      data: { token: verificationToken, userId: user.id, expiresAt: verificationExpiry },
    });

    // Send verification + welcome emails (non-blocking — don't fail registration if email fails)
    sendVerificationEmail(user.email, verificationToken).catch((e) =>
      console.error('❌ Verification email failed:', e?.message)
    );
    sendWelcomeEmail(user.email, user.firstName).catch((e) =>
      console.error('❌ Welcome email failed:', e?.message)
    );

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    return {
      user: sanitizeUser(user),
      tokens,
    };
  }

  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check subscription status
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    return {
      user: sanitizeUser(user),
      subscription,
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      throw ApiError.unauthorized('Refresh token not found');
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      throw ApiError.unauthorized('Refresh token expired');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Delete old refresh token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    // Store new refresh token
    const newRefreshTokenExpiry = new Date();
    newRefreshTokenExpiry.setDate(newRefreshTokenExpiry.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: newRefreshTokenExpiry,
      },
    });

    return tokens;
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Store reset token (1h expiry)
    const resetToken = generateToken();
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1);
    await prisma.passwordResetToken.create({
      data: { token: resetToken, userId: user.id, expiresAt: resetExpiry },
    });

    await sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(data: ResetPasswordInput) {
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: data.token },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw ApiError.badRequest('Invalid or expired password reset link');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword },
    });

    // Invalidate token and all refresh tokens for security
    await prisma.passwordResetToken.delete({ where: { token: data.token } });
    await prisma.refreshToken.deleteMany({ where: { userId: tokenRecord.userId } });

    return { message: 'Password reset successful' };
  }

  async verifyEmail(token: string) {
    const tokenRecord = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      throw ApiError.badRequest('Invalid verification link');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { token } });
      throw ApiError.badRequest('Verification link has expired — please request a new one');
    }

    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { isEmailVerified: true },
    });

    await prisma.emailVerificationToken.delete({ where: { token } });

    return { message: 'Email verified successfully' };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        profile: true,
        streaks: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return sanitizeUser(user);
  }
}
