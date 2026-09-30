import { Inject, Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../ports/outgoing/user.repository.port';
import { SignupTransactionPort } from '../../ports/outgoing/signup-transaction.port';
import { VerificationTokenRepositoryPort } from '../../ports/outgoing/verification-token.repository.port';
import { PasswordHasherPort } from '../../ports/outgoing/password-hasher.port';
import { AuthMailerPort } from '../../ports/outgoing/auth-mailer.port';
import { Email } from '../../../domain/value-objects/email.vo';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';
import { AuthTokenType } from '../../../domain/enums/token-type.enum';
import { EMAIL_VERIFICATION_TOKEN_TTL } from '../../../domain/constants/auth.constants';
import { OneTimeTokenPort } from '../../ports/outgoing/one-time-token.port';

import { SignupCommand } from '../../commands/signup.command';

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepo: UserRepositoryPort,
    @Inject('SignupTransactionPort')
    private readonly signupTransaction: SignupTransactionPort,
    @Inject('VerificationTokenRepositoryPort')
    private readonly verificationTokenRepo: VerificationTokenRepositoryPort,
    @Inject('PasswordHasherPort')
    private readonly passwordHasher: PasswordHasherPort,
    @Inject('AuthMailerPort')
    private readonly mailer: AuthMailerPort,
    @Inject('OneTimeTokenPort')
    private readonly oneTimeToken: OneTimeTokenPort,
  ) {}

  async execute(command: SignupCommand): Promise<{ message: string }> {
    const email = new Email(command.email);

    const existingUser = await this.userRepo.findByEmailWithPassword(email.value);
    if (existingUser) {
      if (!existingUser.password || existingUser.emailVerified) {
        await this.passwordHasher.hashPassword(command.password);
        return { message: AUTH_ERRORS.SIGNUP_SUCCESS };
      }
      const passwordValid = await this.passwordHasher.validatePassword(
        command.password,
        existingUser.password,
      );
      if (!passwordValid) return { message: AUTH_ERRORS.SIGNUP_SUCCESS };

      const token = this.oneTimeToken.create();
      await this.verificationTokenRepo.issueLatest({
        email: email.value,
        token: token.hash,
        type: AuthTokenType.EMAIL_VERIFICATION,
        expires: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL),
      });
      await this.mailer.sendVerificationEmail(email.value, token.raw);
      return { message: AUTH_ERRORS.SIGNUP_SUCCESS };
    }

    const hashedPassword = await this.passwordHasher.hashPassword(command.password);

    const token = this.oneTimeToken.create();
    const created = await this.signupTransaction.createPending(
      {
        email: email.value,
        password: hashedPassword,
        firstName: command.firstName || null,
        lastName: command.lastName || null,
        emailVerified: null,
      },
      {
        email: email.value,
        token: token.hash,
        type: AuthTokenType.EMAIL_VERIFICATION,
        expires: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL),
      },
    );

    if (created) await this.mailer.sendVerificationEmail(email.value, token.raw);

    return { message: AUTH_ERRORS.SIGNUP_SUCCESS };
  }
}
