import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthMailerAdapter } from '../../../infrastructure/integrations/auth-mailer.adapter';
import { EmailService } from '../../../../email/email.service';

describe('AuthMailerAdapter logging', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    [
      'verification',
      (mailer: AuthMailerAdapter) =>
        mailer.sendVerificationEmail('person@example.com', 'TEST_TOKEN_SECRET'),
    ],
    [
      'reset',
      (mailer: AuthMailerAdapter) =>
        mailer.sendPasswordResetEmail('person@example.com', 'TEST_TOKEN_SECRET'),
    ],
  ])('should_not_log_credentials_when_%s_delivery_fails', async (_kind, send) => {
    const error = new Error('SMTP failed for person@example.com with TEST_TOKEN_SECRET');
    const emailService = { sendMail: jest.fn().mockRejectedValue(error) };
    const configService = {
      get: jest.fn().mockReturnValue({ frontendUrl: 'http://localhost:3000' }),
    };
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const mailer = new AuthMailerAdapter(
      emailService as unknown as EmailService,
      configService as unknown as ConfigService,
    );

    await expect(send(mailer)).rejects.toThrow();

    const logged = [...consoleSpy.mock.calls, ...loggerSpy.mock.calls]
      .flat()
      .map((value: unknown) => (value instanceof Error ? value.message : String(value)))
      .join(' ');
    expect(logged).not.toContain('person@example.com');
    expect(logged).not.toContain('TEST_TOKEN_SECRET');
    expect(logged).toContain('delivery failed');
    expect(emailService.sendMail).toHaveBeenCalledTimes(1);
  });
});
