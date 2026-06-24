import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserRepositoryPort } from '../../ports/outgoing/user.repository.port';
import { VerificationTokenRepositoryPort } from '../../ports/outgoing/verification-token.repository.port';
import { AuthMailerPort } from '../../ports/outgoing/auth-mailer.port';
import { Email } from '../../../domain/value-objects/email.vo';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';
import { AuthTokenType } from '../../../domain/enums/token-type.enum';
import { PASSWORD_RESET_TOKEN_TTL } from '../../../domain/constants/auth.constants';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepo: UserRepositoryPort,
    @Inject('VerificationTokenRepositoryPort')
    private readonly verificationTokenRepo: VerificationTokenRepositoryPort,
    @Inject('AuthMailerPort')
    private readonly mailer: AuthMailerPort,
  ) {}

  async execute(rawEmail: string): Promise<{ message: string }> {
    const email = new Email(rawEmail);
    const user = await this.userRepo.findByEmail(email.value);

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: AUTH_ERRORS.FORGOT_PASSWORD_SUCCESS };
    }

    await this.verificationTokenRepo.deleteManyByEmailAndType(
      email.value,
      AuthTokenType.PASSWORD_RESET,
    );

    const token = randomUUID();
    await this.verificationTokenRepo.create({
      email: email.value,
      token,
      type: AuthTokenType.PASSWORD_RESET,
      expires: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL),
    });

    await this.mailer.sendPasswordResetEmail(email.value, token);

    return { message: AUTH_ERRORS.FORGOT_PASSWORD_SUCCESS };
  }
}
