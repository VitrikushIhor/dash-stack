import { BadRequestException } from '../../../common/exceptions/domain.exception';

export class Email {
  public readonly value: string;

  constructor(raw: string) {
    const normalized = raw.trim().toLowerCase();

    if (!normalized || !Email.isValid(normalized)) {
      throw new BadRequestException('Invalid email address');
    }

    this.value = normalized;
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
