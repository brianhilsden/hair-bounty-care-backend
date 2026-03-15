import { Resend } from 'resend';
import { env } from '../config/env';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const FROM = env.EMAIL_FROM || 'Hair Bounty Care <onboarding@resend.dev>';

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!resend) {
    console.log('\n📧 Email (Development Mode — set RESEND_API_KEY to send real emails):');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}\n`);
    return;
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error('❌ Resend error:', error);
    throw new Error(error.message);
  }
  console.log(`✅ Email sent to ${to}`);
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `${env.FRONTEND_URL || 'http://localhost:8081'}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3F2D25; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #D2994A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Hair Bounty Care!</h1>
            <p>Grow. Glow. Flourish.</p>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for joining Hair Bounty Care! To complete your registration and start your personalized hair care journey, please verify your email address.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p style="margin-top: 30px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Hair Bounty Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(to, 'Verify Your Email - Hair Bounty Care', html);
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetUrl = `${env.FRONTEND_URL || 'http://localhost:8081'}/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3F2D25; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #D2994A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p style="margin-top: 30px; color: #d9534f;"><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Hair Bounty Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(to, 'Reset Your Password - Hair Bounty Care', html);
};

export const sendWelcomeEmail = async (to: string, firstName: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3F2D25; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Hair Bounty Care, ${firstName}!</h1>
            <p>🌟 Grow. Glow. Flourish. 🌟</p>
          </div>
          <div class="content">
            <h2>Your Hair Journey Starts Now!</h2>
            <p>We're thrilled to have you join our community of hair care enthusiasts. Your 7-day free trial has begun!</p>
            <h3>What's Next?</h3>
            <ul>
              <li>✅ Complete your hair profile to get personalized recommendations</li>
              <li>✅ Set your hair goals (length, density, health)</li>
              <li>✅ Take your first progress photo</li>
              <li>✅ Join community groups and connect with others</li>
              <li>✅ Start tracking your daily routine and build your streak!</li>
            </ul>
            <p style="margin-top: 30px;">Here's to healthy, happy hair! 💚</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Hair Bounty Care. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(to, `Welcome to Hair Bounty Care, ${firstName}!`, html);
};
