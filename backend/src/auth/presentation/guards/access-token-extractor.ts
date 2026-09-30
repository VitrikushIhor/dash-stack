import { ExtractJwt } from 'passport-jwt';
import type { Request } from 'express';
import { AUTH_COOKIE_NAMES } from '../../domain/constants/auth.constants';

export function extractAccessToken(request: Request): string | null {
  const cookieToken: unknown = request.cookies?.[AUTH_COOKIE_NAMES.ACCESS_TOKEN];
  const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

  if (cookieToken !== undefined && cookieToken !== null) {
    if (typeof cookieToken !== 'string' || cookieToken.length === 0 || bearerToken) {
      return null;
    }

    return cookieToken;
  }

  return bearerToken;
}
