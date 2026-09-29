import { Inject, Injectable, Logger } from '@nestjs/common';
import { OAuthSignupTransactionPort } from '../../ports/outgoing/oauth-signup-transaction.port';
import { UserRepositoryPort } from '../../ports/outgoing/user.repository.port';
import { AccountRepositoryPort } from '../../ports/outgoing/account.repository.port';
import { TokenGeneratorPort } from '../../ports/outgoing/token-generator.port';
import { Auth0ClientPort, Auth0UserInfo } from '../../ports/outgoing/auth0-client.port';
import { AuthTokens } from '../../../shared/types/token.type';
import { parseOAuthSubject } from '../../../domain/policies/oauth-identity.policy';
import {
  ConflictException,
  UnauthorizedException,
} from '../../../../common/exceptions/domain.exception';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';

import { OAuthExchangeCommand } from '../../commands/oauth-exchange.command';

@Injectable()
export class OAuthExchangeUseCase {
  private readonly logger = new Logger(OAuthExchangeUseCase.name);

  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepo: UserRepositoryPort,
    @Inject('AccountRepositoryPort')
    private readonly accountRepo: AccountRepositoryPort,
    @Inject('TokenGeneratorPort')
    private readonly tokenGenerator: TokenGeneratorPort,
    @Inject('Auth0ClientPort')
    private readonly auth0Client: Auth0ClientPort,
    @Inject('OAuthSignupTransactionPort')
    private readonly oauthSignup: OAuthSignupTransactionPort,
  ) {}

  async execute(command: OAuthExchangeCommand): Promise<AuthTokens> {
    const userInfo = await this.auth0Client.getUserInfo(command.auth0Token);
    return this.authenticate(userInfo);
  }

  async executeCode(code: string, codeVerifier: string, userAgent?: string): Promise<AuthTokens> {
    const userInfo = await this.auth0Client.exchangeCode(code, codeVerifier);
    return this.authenticate(userInfo, userAgent);
  }

  private async authenticate(userInfo: Auth0UserInfo, userAgent?: string): Promise<AuthTokens> {
    if (userInfo.email_verified !== true) {
      throw new UnauthorizedException(AUTH_ERRORS.AUTH0_EMAIL_NOT_VERIFIED);
    }

    const [provider, providerAccountId] = parseOAuthSubject(userInfo.sub);

    const existingAccount = await this.accountRepo.findByProvider(provider, providerAccountId);

    if (existingAccount) {
      this.logger.log(`OAuth login succeeded via ${provider}`);
      return userAgent
        ? this.tokenGenerator.generateTokens(existingAccount.user.id, userAgent)
        : this.tokenGenerator.generateTokens(existingAccount.user.id);
    }

    const existingUser = await this.userRepo.findByEmail(userInfo.email);
    if (existingUser) {
      throw new ConflictException(AUTH_ERRORS.AUTH0_LINKING_NOT_ALLOWED);
    }

    const userId = await this.oauthSignup.create({
      user: {
        email: userInfo.email,
        firstName: userInfo.name?.split(' ')[0] || null,
        lastName: userInfo.name?.split(' ').slice(1).join(' ') || null,
        avatar: userInfo.picture || null,
        emailVerified: new Date(),
      },
      provider,
      providerAccountId,
    });
    this.logger.log(`OAuth account created via ${provider}`);
    return userAgent
      ? this.tokenGenerator.generateTokens(userId, userAgent)
      : this.tokenGenerator.generateTokens(userId);
  }
}
