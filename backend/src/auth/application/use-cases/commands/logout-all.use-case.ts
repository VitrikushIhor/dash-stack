import { Inject, Injectable } from '@nestjs/common';
import { AuthSessionRepositoryPort } from '../../ports/outgoing/auth-session.repository.port';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';

import { LogoutAllCommand } from '../../commands/logout-all.command';

@Injectable()
export class LogoutAllUseCase {
  constructor(
    @Inject('AuthSessionRepositoryPort')
    private readonly authSessionRepo: AuthSessionRepositoryPort,
  ) {}

  async execute(command: LogoutAllCommand): Promise<{ message: string }> {
    await this.authSessionRepo.revokeAllByUserId(command.userId, new Date());
    return { message: AUTH_ERRORS.LOGOUT_ALL_SUCCESS };
  }
}
