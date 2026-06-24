import { Inject, Injectable } from '@nestjs/common';
import { BadRequestException } from '../../../../common/exceptions/domain.exception';
import { VerificationTokenRepositoryPort } from '../../ports/outgoing/verification-token.repository.port';
import { UserRepositoryPort } from '../../ports/outgoing/user.repository.port';
import { TokenGeneratorPort } from '../../ports/outgoing/token-generator.port';
import { TokenExpiryPolicy } from '../../../domain/policies/token-expiry.policy';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';
import { AuthTokens } from '../../../shared/types/token.type';
import { AuthTokenType } from '../../../domain/enums/token-type.enum';

import { VerifyEmailCommand } from '../../commands/verify-email.command';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject('VerificationTokenRepositoryPort')
    private readonly verificationTokenRepo: VerificationTokenRepositoryPort,
    @Inject('UserRepositoryPort')
    private readonly userRepo: UserRepositoryPort,
    @Inject('TokenGeneratorPort')
    private readonly tokenGenerator: TokenGeneratorPort,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<AuthTokens> {
    const verificationToken = await this.verificationTokenRepo.findByToken(
      command.token,
    );

    if (!verificationToken) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_VERIFICATION_TOKEN);
    }

    if (verificationToken.type !== AuthTokenType.EMAIL_VERIFICATION) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN_TYPE);
    }

    TokenExpiryPolicy.assertNotExpired(
      verificationToken.expires,
      AUTH_ERRORS.VERIFICATION_TOKEN_EXPIRED,
    );

    const user = await this.userRepo.updateEmailVerified(
      verificationToken.email,
      new Date(),
    );

    await this.verificationTokenRepo.deleteById(verificationToken.id);

    return this.tokenGenerator.generateTokens(user.id);
  }
}
