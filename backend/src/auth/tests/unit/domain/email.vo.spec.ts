import { Email } from '../../../domain/value-objects/email.vo';
import { BadRequestException } from '../../../../common/exceptions/domain.exception';

describe('Email Value Object', () => {
  it('should create an email object for a valid email', () => {
    const email = new Email('test@example.com');
    expect(email.value).toBe('test@example.com');
  });

  it('should normalize the email (trim and lowercase)', () => {
    const email = new Email('  Test.User@EXAMPLE.COM  ');
    expect(email.value).toBe('test.user@example.com');
  });

  it('should throw BadRequestException for invalid emails', () => {
    const invalidEmails = [
      '',
      '   ',
      'invalid-email',
      'test@',
      '@example.com',
      'test@example',
      'test example@test.com',
    ];

    invalidEmails.forEach((invalid) => {
      expect(() => new Email(invalid)).toThrow(BadRequestException);
      expect(() => new Email(invalid)).toThrow('Invalid email address');
    });
  });
});
