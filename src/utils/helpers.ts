import crypto from 'crypto';

/**
 * Generate a unique referral code
 */
export const generateReferralCode = (userId: string): string => {
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  const userPart = userId.slice(0, 4).toUpperCase();
  return `HB${userPart}${randomPart}`;
};

/**
 * Generate a random token for email verification or password reset
 */
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Calculate pagination meta
 */
export const calculatePagination = (page: number, limit: number, total: number) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Sanitize user object (remove password)
 */
export const sanitizeUser = (user: any) => {
  const { password, ...sanitized } = user;
  return sanitized;
};
