import { Inject, Injectable } from '@nestjs/common';
import { ConflictException } from '../../../../common/exceptions/domain.exception';
import { randomUUID } from 'crypto';
import { UserRepositoryPort } from '../../ports/outgoing/user.repository.port';
import { VerificationTokenRepositoryPort } from '../../ports/outgoing/verification-token.repository.port';
import { PasswordHasherPort } from '../../ports/outgoing/password-hasher.port';
import { AuthMailerPort } from '../../ports/outgoing/auth-mailer.port';
import { Email } from '../../../domain/value-objects/email.vo';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';
import { AuthTokenType } from '../../../domain/enums/token-type.enum';
import { EMAIL_VERIFICATION_TOKEN_TTL } from '../../../domain/constants/auth.constants';

import { SignupCommand } from '../../commands/signup.command';

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepo: UserRepositoryPort,
    @Inject('VerificationTokenRepositoryPort')
    private readonly verificationTokenRepo: VerificationTokenRepositoryPort,
    @Inject('PasswordHasherPort')
    private readonly passwordHasher: PasswordHasherPort,
    @Inject('AuthMailerPort')
    private readonly mailer: AuthMailerPort,
  ) {}

  async execute(command: SignupCommand): Promise<{ message: string }> {
    const email = new Email(command.email);

    const existingUser = await this.userRepo.findByEmail(email.value);
    if (existingUser) {
      throw new ConflictException(AUTH_ERRORS.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await this.passwordHasher.hashPassword(
      command.password,
    );

    const user = await this.userRepo.create({
      email: email.value,
      password: hashedPassword,
      firstName: command.firstName || null,
      lastName: command.lastName || null,
      emailVerified: null,
    });

    const token = randomUUID();
    await this.verificationTokenRepo.create({
      email: user.email,
      token,
      type: AuthTokenType.EMAIL_VERIFICATION,
      expires: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL),
    });

    await this.mailer.sendVerificationEmail(user.email, token);

    return { message: AUTH_ERRORS.SIGNUP_SUCCESS };
  }
}
