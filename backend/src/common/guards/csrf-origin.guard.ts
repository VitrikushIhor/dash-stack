import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const SAFE_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD', 'OPTIONS']);
const TRUSTED_FETCH_SITES: ReadonlySet<string> = new Set(['same-origin', 'same-site']);
const UNTRUSTED_ORIGIN_MESSAGE = 'Request origin is not trusted';

function isTrustedMutation(request: Request, allowedOrigins: readonly string[]): boolean {
  const origin = request.headers.origin;
  const fetchSite = request.headers['sec-fetch-site'];
  const trustedOrigin = typeof origin === 'string' && allowedOrigins.includes(origin);

  if (origin !== undefined && !trustedOrigin) return false;
  if (fetchSite !== undefined && !TRUSTED_FETCH_SITES.has(fetchSite)) return false;
  if (fetchSite === 'same-site' && !trustedOrigin) return false;
  if (typeof request.headers.cookie === 'string' && !trustedOrigin) return false;

  return true;
}

@Injectable()
export class CsrfOriginGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(request.method)) return true;

    const allowedOrigins = this.configService.get<{ origins: string[] }>('cors')?.origins ?? [];
    if (!isTrustedMutation(request, allowedOrigins)) {
      throw new ForbiddenException(UNTRUSTED_ORIGIN_MESSAGE);
    }

    return true;
  }
}
