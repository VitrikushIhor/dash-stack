import { TokenExpiryPolicy } from '../../../domain/policies/token-expiry.policy';
import { BadRequestException } from '../../../../common/exceptions/domain.exception';

describe('TokenExpiryPolicy', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-24T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should not throw if the token expires in the future', () => {
    const futureDate = new Date('2026-06-25T12:00:00Z');
    expect(() =>
      TokenExpiryPolicy.assertNotExpired(futureDate, 'Token expired'),
    ).not.toThrow();
  });

  it('should throw BadRequestException if the token is already expired', () => {
    const pastDate = new Date('2026-06-23T12:00:00Z');
    expect(() =>
      TokenExpiryPolicy.assertNotExpired(
        pastDate,
        'Token expired custom error',
      ),
    ).toThrow(BadRequestException);

    expect(() =>
      TokenExpiryPolicy.assertNotExpired(
        pastDate,
        'Token expired custom error',
      ),
    ).toThrow('Token expired custom error');
  });
});
