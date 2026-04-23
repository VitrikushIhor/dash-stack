import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokensService } from './tokens.service';
import { Token } from '../models/token.model';
import { UserRepository } from '../repositories/user.repository';
import { AccountRepository } from '../repositories/account.repository';

interface Auth0UserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService,
    private readonly userRepo: UserRepository,
    private readonly accountRepo: AccountRepository,
  ) {}

  async exchangeAuth0Token(auth0Token: string): Promise<Token> {
    const userInfo = await this.getAuth0UserInfo(auth0Token);
    const user = await this.findOrCreateOAuthUser(userInfo);
    return this.tokensService.generateTokens(user.id);
  }

  private async getAuth0UserInfo(token: string): Promise<Auth0UserInfo> {
    const domain = this.configService.get<string>('AUTH0_DOMAIN');

    if (!domain) {
      throw new UnauthorizedException('Auth0 domain is not configured');
    }

    const response = await fetch(`https://${domain}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      this.logger.warn(`Auth0 /userinfo failed with status ${response.status}`);
      throw new UnauthorizedException('Invalid Auth0 token');
    }

    const userInfo = await response.json();

    if (!userInfo.email) {
      throw new UnauthorizedException(
        'Auth0 token does not contain email information',
      );
    }

    return userInfo;
  }

  private async findOrCreateOAuthUser(userInfo: Auth0UserInfo) {
    const { sub, email, name, picture } = userInfo;
    const [provider, providerAccountId] = this.parseAuth0Sub(sub);

    const existingAccount = await this.accountRepo.findByProvider(
      provider,
      providerAccountId,
    );

    if (existingAccount) {
      this.logger.log(
        `OAuth login: existing user ${existingAccount.user.email} via ${provider}`,
      );
      return existingAccount.user;
    }

    let user = await this.userRepo.findByEmail(email);

    if (user) {
      this.logger.log(
        `OAuth login: linking ${provider} to existing user ${email}`,
      );
    } else {
      const firstName = name?.split(' ')[0] || null;
      const lastName = name?.split(' ').slice(1).join(' ') || null;

      user = await this.userRepo.create({
        email,
        firstName,
        lastName,
        avatar: picture || null,
        emailVerified: new Date(),
      });

      this.logger.log(`OAuth login: created new user ${email} via ${provider}`);
    }

    await this.accountRepo.create({
      userId: user.id,
      provider,
      providerAccountId,
    });

    return user;
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
      return ['unknown', sub];
    }

    const rawProvider = sub.substring(0, separatorIndex);
    const accountId = sub.substring(separatorIndex + 1);
    const provider = rawProvider.replace('-oauth2', '');

    return [provider, accountId];
  }
}
