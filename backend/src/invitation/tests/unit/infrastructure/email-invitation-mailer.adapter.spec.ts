import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../../email/email.service';
import { EmailInvitationMailerAdapter } from '../../../infrastructure/integrations/email-invitation-mailer.adapter';

describe('EmailInvitationMailerAdapter', () => {
  it('should_send_raw_token_to_the_existing_accept_invite_route', async () => {
    const sendMail = jest.fn().mockResolvedValue(undefined);
    const adapter = new EmailInvitationMailerAdapter(
      { sendMail } as unknown as EmailService,
      new ConfigService({ email: { frontendUrl: 'https://app.example.com' } }),
    );

    await adapter.sendInviteEmail('user@example.com', 'raw-token', 'Example Org');

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        html: expect.stringContaining('https://app.example.com/accept-invite?token=raw-token'),
      }),
    );
  });
});
