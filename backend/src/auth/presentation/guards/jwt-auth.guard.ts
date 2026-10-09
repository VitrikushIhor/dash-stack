import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_ERRORS } from '../../domain/constants/auth-errors';
import { UnauthorizedException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(error: unknown, user: TUser | false | null | undefined): TUser {
    if (error) throw error;
    if (user === false || user === null || user === undefined) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_ACCESS_TOKEN);
    }

    return user;
  }
}
