import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { AUTH_COOKIE_NAMES } from '../../domain/constants/auth.constants';

export const RefreshToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const bodyToken = request.body?.token || request.body?.refreshToken;
    const cookieToken = request.cookies?.[AUTH_COOKIE_NAMES.REFRESH_TOKEN];

    return bodyToken || cookieToken || undefined;
  },
);
