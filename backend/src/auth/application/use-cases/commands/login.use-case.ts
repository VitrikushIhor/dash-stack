import { Inject, Injectable } from '@nestjs/common';
import {
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '../../../../common/exceptions/domain.exception';
import { UserRepositoryPort } from '../../ports/outgoing/user.repository.port';
import { PasswordHasherPort } from '../../ports/outgoing/password-hasher.port';
import { TokenGeneratorPort } from '../../ports/outgoing/token-generator.port';
import { Email } from '../../../domain/value-objects/email.vo';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';
import { AuthTokens } from '../../../shared/types/token.type';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepo: UserRepositoryPort,
    @Inject('PasswordHasherPort')
    private readonly passwordHasher: PasswordHasherPort,
    @Inject('TokenGeneratorPort')
    private readonly tokenGenerator: TokenGeneratorPort,
  ) {}

  async execute(rawEmail: string, password: string): Promise<AuthTokens> {
    const email = new Email(rawEmail);
    const user = await this.userRepo.findByEmail(email.value);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    if (!user.password) {
      throw new BadRequestException(AUTH_ERRORS.SOCIAL_LOGIN_ONLY);
    }

    const passwordValid = await this.passwordHasher.validatePassword(
      password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    if (!user.emailVerified) {
      throw new ForbiddenException(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
    }

    return this.tokenGenerator.generateTokens(user.id);
  }
}
