import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserRepositoryPort } from '../../ports/outgoing/user.repository.port';
import { VerificationTokenRepositoryPort } from '../../ports/outgoing/verification-token.repository.port';
import { AuthMailerPort } from '../../ports/outgoing/auth-mailer.port';
import { Email } from '../../../domain/value-objects/email.vo';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';
import { AuthTokenType } from '../../../domain/enums/token-type.enum';
import { PASSWORD_RESET_TOKEN_TTL } from '../../../domain/constants/auth.constants';
import { OneTimeTokenPort } from '../../ports/outgoing/one-time-token.port';

import { ForgotPasswordCommand } from '../../commands/forgot-password.command';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepo: UserRepositoryPort,
    @Inject('VerificationTokenRepositoryPort')
    private readonly verificationTokenRepo: VerificationTokenRepositoryPort,
    @Inject('AuthMailerPort')
    private readonly mailer: AuthMailerPort,
    @Inject('OneTimeTokenPort')
    private readonly oneTimeToken: OneTimeTokenPort,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<{ message: string }> {
    const email = new Email(command.email);
    const user = await this.userRepo.findByEmail(email.value);

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: AUTH_ERRORS.FORGOT_PASSWORD_SUCCESS };
    }

    const token = this.oneTimeToken.create();
    await this.verificationTokenRepo.issueLatest({
      email: email.value,
      token: token.hash,
      type: AuthTokenType.PASSWORD_RESET,
      expires: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL),
    });

    try {
      await this.mailer.sendPasswordResetEmail(email.value, token.raw);
    } catch {
      this.logger.error('Password reset email delivery failed');
    }

    return { message: AUTH_ERRORS.FORGOT_PASSWORD_SUCCESS };
  }
}
