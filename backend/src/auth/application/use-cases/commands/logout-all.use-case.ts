import { Inject, Injectable } from '@nestjs/common';
import { RefreshTokenRepositoryPort } from '../../ports/outgoing/refresh-token.repository.port';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';

@Injectable()
export class LogoutAllUseCase {
  constructor(
    @Inject('RefreshTokenRepositoryPort')
    private readonly refreshTokenRepo: RefreshTokenRepositoryPort,
  ) {}

  async execute(userId: string): Promise<{ message: string }> {
    await this.refreshTokenRepo.deleteAllByUserId(userId);
    return { message: AUTH_ERRORS.LOGOUT_ALL_SUCCESS };
  }
}
