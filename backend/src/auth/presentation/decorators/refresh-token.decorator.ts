import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { extractRefreshToken } from '../validators/refresh-token-request.validator';

export const RefreshToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined =>
    extractRefreshToken(context.switchToHttp().getRequest<Request>()),
);
