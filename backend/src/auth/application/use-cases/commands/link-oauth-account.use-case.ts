import { LinkOAuthAccountCommand } from '../../commands/link-oauth-account.command';
import { Inject, Injectable } from '@nestjs/common';
import { Auth0ClientPort } from '../../ports/outgoing/auth0-client.port';
import { LinkedAccountsPort } from '../../ports/outgoing/linked-accounts.port';
import {
  LINKABLE_OAUTH_PROVIDERS,
  parseOAuthSubject,
} from '../../../domain/policies/oauth-identity.policy';
import { UnauthorizedException } from '../../../../common/exceptions/domain.exception';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';

@Injectable()
export class LinkOAuthAccountUseCase {
  constructor(
    @Inject('Auth0ClientPort') private readonly auth0: Auth0ClientPort,
    @Inject('LinkedAccountsPort') private readonly accounts: LinkedAccountsPort,
  ) {}

  async execute(command: LinkOAuthAccountCommand): Promise<{ linked: true }> {
    const identity = await this.auth0.exchangeCode(command.code, command.codeVerifier);
    if (identity.email_verified !== true) {
      throw new UnauthorizedException(AUTH_ERRORS.AUTH0_EMAIL_NOT_VERIFIED);
    }
    const [provider, accountId] = parseOAuthSubject(identity.sub);
    if (
      provider !== command.provider ||
      !LINKABLE_OAUTH_PROVIDERS.some((value) => value === provider)
    ) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_AUTH0_IDENTITY);
    }
    await this.accounts.link(command.userId, provider, accountId);
    return { linked: true };
  }
}
