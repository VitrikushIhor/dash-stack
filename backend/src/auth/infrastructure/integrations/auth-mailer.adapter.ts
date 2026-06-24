import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../email/email.service';
import { EmailConfig } from '../../../common/configs/config.interface';
import { AuthMailerPort } from '../../application/ports/outgoing/auth-mailer.port';

@Injectable()
export class AuthMailerAdapter implements AuthMailerPort {
  private emailConfig: EmailConfig;

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.emailConfig = this.configService.get<EmailConfig>('email');
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.emailConfig.frontendUrl}/verify-email?token=${token}`;

    const html = `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;">Verify Email</a>
      <p style="margin-top:16px;color:#666;">Or copy this link: ${verificationUrl}</p>
      <p style="color:#999;font-size:12px;">This link expires in 24 hours.</p>
    `;

    try {
      await this.emailService.sendMail({
        to: email,
        subject: 'Verify your email',
        html,
      });
    } catch (error) {
      console.error('Email send error:', error);
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.emailConfig.frontendUrl}/reset-password?token=${token}`;

    const html = `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;">Reset Password</a>
      <p style="margin-top:16px;color:#666;">Or copy this link: ${resetUrl}</p>
      <p style="color:#999;font-size:12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `;

    try {
      await this.emailService.sendMail({
        to: email,
        subject: 'Reset your password',
        html,
      });
    } catch (error) {
      console.error('Email send error:', error);
      throw new InternalServerErrorException(
        'Failed to send password reset email',
      );
    }
  }
}
