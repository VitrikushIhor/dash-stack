import { BadRequestException } from '../../../common/exceptions/domain.exception';
import { AUTH_COOKIE_NAMES } from '../../domain/constants/auth.constants';
import { AUTH_ERRORS } from '../../domain/constants/auth-errors';

const REFRESH_TOKEN_PATTERN = /^[A-Za-z0-9._~-]{1,4096}$/;
const REFRESH_TOKEN_BODY_FIELDS = ['token', 'refreshToken'] as const;

type RefreshTokenRequest = {
  body?: unknown;
  cookies?: unknown;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readBodyToken(body: unknown): { provided: boolean; token: unknown } {
  if (body === undefined) return { provided: false, token: undefined };
  if (!isObjectRecord(body)) throw new BadRequestException(AUTH_ERRORS.INVALID_REFRESH_TOKEN_BODY);

  const fields = Object.keys(body);
  const hasToken = fields.includes(REFRESH_TOKEN_BODY_FIELDS[0]);
  const hasRefreshToken = fields.includes(REFRESH_TOKEN_BODY_FIELDS[1]);

  if (
    fields.some(
      (field) => !REFRESH_TOKEN_BODY_FIELDS.includes(field as 'token' | 'refreshToken'),
    ) ||
    (hasToken && hasRefreshToken)
  ) {
    throw new BadRequestException(AUTH_ERRORS.INVALID_REFRESH_TOKEN_BODY);
  }

  if (hasToken) return { provided: true, token: body.token };
  if (hasRefreshToken) return { provided: true, token: body.refreshToken };
  return { provided: false, token: undefined };
}

function readCookieToken(cookies: unknown): unknown {
  if (!isObjectRecord(cookies)) return undefined;
  return cookies[AUTH_COOKIE_NAMES.REFRESH_TOKEN];
}

export function extractRefreshToken(request: RefreshTokenRequest): string | undefined {
  const bodyToken = readBodyToken(request.body);
  const token = bodyToken.provided ? bodyToken.token : readCookieToken(request.cookies);

  if (token === undefined) return undefined;
  if (typeof token !== 'string' || !REFRESH_TOKEN_PATTERN.test(token)) {
    throw new BadRequestException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
  }

  return token;
}
