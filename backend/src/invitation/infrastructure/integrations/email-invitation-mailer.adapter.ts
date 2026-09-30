import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvitationMailerPort } from '../../application/ports/invitation-mailer.port';
import { EmailService } from '../../../email/email.service';
import { EmailConfig } from '../../../common/configs/config.interface';

@Injectable()
export class EmailInvitationMailerAdapter implements InvitationMailerPort {
  private readonly logger = new Logger(EmailInvitationMailerAdapter.name);
  private emailConfig: EmailConfig;

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.emailConfig = this.configService.get<EmailConfig>('email');
  }

  async sendInviteEmail(email: string, token: string, orgName: string): Promise<void> {
    const acceptUrl = new URL('/accept-invite', this.emailConfig.frontendUrl);
    acceptUrl.searchParams.set('token', token);
    const escapedOrgName = this.escapeHtml(orgName);

    const subject = `You're invited to join ${orgName}`;
    const html = `
      <h2>Organization Invitation</h2>
      <p>You've been invited to join <strong>${escapedOrgName}</strong> on Dash Stack.</p>
      <p>Click the link below to accept the invitation:</p>
      <a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;">Accept Invitation</a>
      <p style="margin-top:16px;color:#666;">Or copy this link: ${acceptUrl}</p>
      <p style="color:#999;font-size:12px;">This invitation expires in 7 days.</p>
    `;

    try {
      await this.emailService.sendMail({
        to: email,
        subject,
        html,
      });
    } catch {
      this.logger.warn('Invitation email delivery failed');
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
