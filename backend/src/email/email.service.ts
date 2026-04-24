import { EmailConfig } from './../common/configs/config.interface';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private emailConfig: EmailConfig;

  constructor(private readonly configService: ConfigService) {
    this.emailConfig = this.configService.get<EmailConfig>('email');
    this.transporter = nodemailer.createTransport({
      host: this.emailConfig.host,
      port: this.emailConfig.port,
      secure: false,
      auth: {
        user: this.emailConfig.user,
        pass: this.emailConfig.pass,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.emailConfig.frontendUrl}/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"Dash Stack" <${this.emailConfig.user}>`,
        to: email,
        subject: 'Verify your email',
        html: `
          <h2>Email Verification</h2>
          <p>Click the link below to verify your email address:</p>
          <a href="${verificationUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;">Verify Email</a>
          <p style="margin-top:16px;color:#666;">Or copy this link: ${verificationUrl}</p>
          <p style="color:#999;font-size:12px;">This link expires in 24 hours.</p>
        `,
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

    try {
      await this.transporter.sendMail({
        from: `"Dash Stack" <${this.emailConfig.user}>`,
        to: email,
        subject: 'Reset your password',
        html: `
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;">Reset Password</a>
          <p style="margin-top:16px;color:#666;">Or copy this link: ${resetUrl}</p>
          <p style="color:#999;font-size:12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        `,
      });
    } catch (error) {
      console.error('Email send error:', error);
      throw new InternalServerErrorException(
        'Failed to send password reset email',
      );
    }
  }

  async sendInviteEmail(
    email: string,
    token: string,
    orgName: string,
  ): Promise<void> {
    const acceptUrl = `${this.emailConfig.frontendUrl}/invite/accept?token=${token}`;
    const escapedOrgName = this.escapeHtml(orgName);

    try {
      await this.transporter.sendMail({
        from: `"Dash Stack" <${this.emailConfig.user}>`,
        to: email,
        subject: `You're invited to join ${orgName}`,
        html: `
          <h2>Organization Invitation</h2>
          <p>You've been invited to join <strong>${escapedOrgName}</strong> on Dash Stack.</p>
          <p>Click the link below to accept the invitation:</p>
          <a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;">Accept Invitation</a>
          <p style="margin-top:16px;color:#666;">Or copy this link: ${acceptUrl}</p>
          <p style="color:#999;font-size:12px;">This invitation expires in 7 days.</p>
        `,
      });
    } catch (error) {
      console.error('Email send error:', error);
      throw new InternalServerErrorException('Failed to send invitation email');
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
