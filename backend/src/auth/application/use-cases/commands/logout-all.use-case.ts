import { Inject, Injectable } from '@nestjs/common';
import { RefreshTokenRepositoryPort } from '../../ports/outgoing/refresh-token.repository.port';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';

import { LogoutAllCommand } from '../../commands/logout-all.command';

@Injectable()
export class LogoutAllUseCase {
  constructor(
    @Inject('RefreshTokenRepositoryPort')
    private readonly refreshTokenRepo: RefreshTokenRepositoryPort,
  ) {}

  async execute(command: LogoutAllCommand): Promise<{ message: string }> {
    await this.refreshTokenRepo.deleteAllByUserId(command.userId);
    return { message: AUTH_ERRORS.LOGOUT_ALL_SUCCESS };
  }
}
