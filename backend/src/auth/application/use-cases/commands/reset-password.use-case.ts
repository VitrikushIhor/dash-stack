import { Inject, Injectable } from '@nestjs/common';
import { BadRequestException } from '../../../../common/exceptions/domain.exception';
import { VerificationTokenRepositoryPort } from '../../ports/outgoing/verification-token.repository.port';
import { UserRepositoryPort } from '../../ports/outgoing/user.repository.port';
import { RefreshTokenRepositoryPort } from '../../ports/outgoing/refresh-token.repository.port';
import { PasswordHasherPort } from '../../ports/outgoing/password-hasher.port';
import { TokenExpiryPolicy } from '../../../domain/policies/token-expiry.policy';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';
import { AuthTokenType } from '../../../domain/enums/token-type.enum';

import { ResetPasswordCommand } from '../../commands/reset-password.command';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject('VerificationTokenRepositoryPort')
    private readonly verificationTokenRepo: VerificationTokenRepositoryPort,
    @Inject('UserRepositoryPort')
    private readonly userRepo: UserRepositoryPort,
    @Inject('RefreshTokenRepositoryPort')
    private readonly refreshTokenRepo: RefreshTokenRepositoryPort,
    @Inject('PasswordHasherPort')
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<{ message: string }> {
    const resetToken = await this.verificationTokenRepo.findByToken(
      command.token,
    );

    if (!resetToken) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_RESET_TOKEN);
    }

    if (resetToken.type !== AuthTokenType.PASSWORD_RESET) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN_TYPE);
    }

    TokenExpiryPolicy.assertNotExpired(
      resetToken.expires,
      AUTH_ERRORS.RESET_TOKEN_EXPIRED,
    );

    const hashedPassword = await this.passwordHasher.hashPassword(
      command.newPassword,
    );

    await this.userRepo.updatePassword(resetToken.email, hashedPassword);
    await this.verificationTokenRepo.deleteById(resetToken.id);

    const user = await this.userRepo.findByEmail(resetToken.email);
    if (user) {
      await this.refreshTokenRepo.deleteAllByUserId(user.id);
    }

    return { message: AUTH_ERRORS.RESET_PASSWORD_SUCCESS };
  }
}
