import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';

jest.mock('nodemailer', () => ({ createTransport: jest.fn() }));

describe('EmailService delivery failure', () => {
  afterEach(() => jest.restoreAllMocks());

  it('should_not_log_recipient_or_credential_when_smtp_fails', async () => {
    const sendMail = jest
      .fn()
      .mockRejectedValue(new Error('SMTP rejected person@example.com and TEST_TOKEN_SECRET'));
    jest.mocked(nodemailer.createTransport).mockReturnValue({
      sendMail,
    } as unknown as nodemailer.Transporter);
    const configService = {
      get: jest.fn().mockReturnValue({
        host: 'localhost',
        port: 1025,
        user: 'sender@example.com',
        pass: 'TEST_SMTP_PASSWORD',
      }),
    };
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const service = new EmailService(configService as unknown as ConfigService);

    await expect(
      service.sendMail({
        to: 'person@example.com',
        subject: 'Verify',
        html: 'TEST_TOKEN_SECRET',
      }),
    ).rejects.toThrow('Failed to send email');

    const logged = [...consoleSpy.mock.calls, ...loggerSpy.mock.calls]
      .flat()
      .map((value: unknown) => (value instanceof Error ? value.message : String(value)))
      .join(' ');
    expect(logged).not.toContain('person@example.com');
    expect(logged).not.toContain('TEST_TOKEN_SECRET');
    expect(logged).not.toContain('TEST_SMTP_PASSWORD');
    expect(logged).toContain('delivery failed');
    expect(sendMail).toHaveBeenCalledTimes(1);
  });
});
