import { Inject, Injectable } from '@nestjs/common';
import { BadRequestException } from '../../../../common/exceptions/domain.exception';
import { AuthSessionRepositoryPort } from '../../ports/outgoing/auth-session.repository.port';
import { SessionCredentialPort } from '../../ports/outgoing/session-credential.port';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';

import { LogoutCommand } from '../../commands/logout.command';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('AuthSessionRepositoryPort')
    private readonly authSessionRepo: AuthSessionRepositoryPort,
    @Inject('SessionCredentialPort')
    private readonly sessionCredential: SessionCredentialPort,
  ) {}

  async execute(command: LogoutCommand): Promise<{ message: string }> {
    const credentialHash = this.sessionCredential.hash(command.refreshToken);
    const revoked = await this.authSessionRepo.revokeByCredentialHash(credentialHash, new Date());

    if (revoked.count === 0) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }

    return { message: AUTH_ERRORS.LOGOUT_SUCCESS };
  }
}
