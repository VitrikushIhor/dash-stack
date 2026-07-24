import type { Response } from 'express';
import {
  AUTH_COOKIE_NAMES,
  AUTH_COOKIE_TTL,
} from '../../domain/constants/auth.constants';

export class AuthCookieHelper {
  static setAuthCookies(
    res: Response,
    tokens: { accessToken?: string; refreshToken?: string },
  ): void {
    const isProduction = process.env.NODE_ENV === 'production';

    if (tokens.accessToken) {
      res.cookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: AUTH_COOKIE_TTL.ACCESS_TOKEN,
        path: '/',
      });
    }

    if (tokens.refreshToken) {
      res.cookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: AUTH_COOKIE_TTL.REFRESH_TOKEN,
        path: '/',
      });
    }
  }

  static clearAuthCookies(res: Response): void {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
  }
}
