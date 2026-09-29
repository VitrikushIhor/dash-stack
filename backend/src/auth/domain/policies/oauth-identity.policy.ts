import { UnauthorizedException } from '../../../common/exceptions/domain.exception';
import { UNKNOWN_PROVIDER } from '../constants/auth.constants';
import { AUTH_ERRORS } from '../constants/auth-errors';

export const LINKABLE_OAUTH_PROVIDERS = ['google', 'github'] as const;

export function parseOAuthSubject(sub: string): [string, string] {
  const separator = sub.indexOf('|');
  const rawProvider = sub.slice(0, separator);
  const accountId = sub.slice(separator + 1);
  const provider = rawProvider.replace('-oauth2', '');
  if (separator < 1 || !accountId || provider === UNKNOWN_PROVIDER) {
    throw new UnauthorizedException(AUTH_ERRORS.INVALID_AUTH0_IDENTITY);
  }
  return [provider, accountId];
}
