import { BadRequestException } from '../../../common/exceptions/domain.exception';

export class TokenExpiryPolicy {
  static assertNotExpired(expiresAt: Date, errorMessage: string): void {
    if (expiresAt < new Date()) {
      throw new BadRequestException(errorMessage);
    }
  }
}
