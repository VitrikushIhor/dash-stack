import { Inject, Injectable } from '@nestjs/common';
import { BadRequestException } from '../../../../common/exceptions/domain.exception';
import { VerificationTokenRepositoryPort } from '../../ports/outgoing/verification-token.repository.port';
import { PasswordHasherPort } from '../../ports/outgoing/password-hasher.port';
import { PasswordResetTransactionPort } from '../../ports/outgoing/password-reset-transaction.port';
import { OneTimeTokenPort } from '../../ports/outgoing/one-time-token.port';
import { TokenExpiryPolicy } from '../../../domain/policies/token-expiry.policy';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';
import { AuthTokenType } from '../../../domain/enums/token-type.enum';

import { ResetPasswordCommand } from '../../commands/reset-password.command';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject('VerificationTokenRepositoryPort')
    private readonly verificationTokenRepo: VerificationTokenRepositoryPort,
    @Inject('PasswordResetTransactionPort')
    private readonly passwordResetTransaction: PasswordResetTransactionPort,
    @Inject('PasswordHasherPort')
    private readonly passwordHasher: PasswordHasherPort,
    @Inject('OneTimeTokenPort')
    private readonly oneTimeToken: OneTimeTokenPort,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<{ message: string }> {
    const tokenHash = this.oneTimeToken.hash(command.token);
    const resetToken = await this.verificationTokenRepo.findByToken(tokenHash);

    if (!resetToken) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_RESET_TOKEN);
    }

    if (resetToken.type !== AuthTokenType.PASSWORD_RESET) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN_TYPE);
    }

    TokenExpiryPolicy.assertNotExpired(resetToken.expires, AUTH_ERRORS.RESET_TOKEN_EXPIRED);

    const hashedPassword = await this.passwordHasher.hashPassword(command.newPassword);

    const completed = await this.passwordResetTransaction.complete({
      tokenId: resetToken.id,
      tokenHash,
      email: resetToken.email,
      hashedPassword,
      now: new Date(),
    });

    if (!completed) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_RESET_TOKEN);
    }

    return { message: AUTH_ERRORS.RESET_PASSWORD_SUCCESS };
  }
}
