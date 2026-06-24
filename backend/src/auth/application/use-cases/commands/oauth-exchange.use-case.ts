import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserRepositoryPort } from '../../ports/outgoing/user.repository.port';
import { AccountRepositoryPort } from '../../ports/outgoing/account.repository.port';
import { TokenGeneratorPort } from '../../ports/outgoing/token-generator.port';
import { Auth0ClientPort } from '../../ports/outgoing/auth0-client.port';
import { AuthTokens } from '../../../shared/types/token.type';
import { UNKNOWN_PROVIDER } from '../../../domain/constants/auth.constants';

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
  ) {}

  async execute(command: OAuthExchangeCommand): Promise<AuthTokens> {
    const userInfo = await this.auth0Client.getUserInfo(command.auth0Token);
    const [provider, providerAccountId] = this.parseAuth0Sub(userInfo.sub);

    const existingAccount = await this.accountRepo.findByProvider(
      provider,
      providerAccountId,
    );

    if (existingAccount) {
      this.logger.log(
        `OAuth login: existing user ${existingAccount.user.email} via ${provider}`,
      );
      return this.tokenGenerator.generateTokens(existingAccount.user.id);
    }

    let user = await this.userRepo.findByEmail(userInfo.email);

    if (user) {
      this.logger.log(
        `OAuth login: linking ${provider} to existing user ${userInfo.email}`,
      );
    } else {
      const firstName = userInfo.name?.split(' ')[0] || null;
      const lastName = userInfo.name?.split(' ').slice(1).join(' ') || null;

      user = await this.userRepo.create({
        email: userInfo.email,
        firstName,
        lastName,
        avatar: userInfo.picture || null,
        emailVerified: new Date(),
      });

      this.logger.log(
        `OAuth login: created new user ${userInfo.email} via ${provider}`,
      );
    }

    await this.accountRepo.create({
      userId: user.id,
      provider,
      providerAccountId,
    });

    return this.tokenGenerator.generateTokens(user.id);
  }

  /**
   * Parse Auth0 `sub` claim into provider and account ID.
   * Examples:
   *   "google-oauth2|123456789" → ["google", "123456789"]
   *   "github|12345"            → ["github", "12345"]
   *   "auth0|abc123"            → ["auth0", "abc123"]
   */
  private parseAuth0Sub(sub: string): [string, string] {
    const separatorIndex = sub.indexOf('|');

    if (separatorIndex === -1) {
      return [UNKNOWN_PROVIDER, sub];
    }

    const rawProvider = sub.substring(0, separatorIndex);
    const accountId = sub.substring(separatorIndex + 1);
    const provider = rawProvider.replace('-oauth2', '');

    return [provider, accountId];
  }
}
