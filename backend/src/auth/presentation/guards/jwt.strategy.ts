import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidateUserUseCase } from '../../application/use-cases/queries/validate-user.use-case';
import { AuthSessionRepositoryPort } from '../../application/ports/outgoing/auth-session.repository.port';
import { isSessionActivityDue } from '../../domain/policies/session-activity.policy';
import { isActiveSessionForUser } from '../../domain/policies/auth-session.policy';
import { AUTH_ERRORS } from '../../domain/constants/auth-errors';
import { UnauthorizedException } from '../../../common/exceptions/domain.exception';
import {
  ACCESS_JWT_AUDIENCE,
  ACCESS_JWT_ISSUER,
} from '../../shared/constants/access-jwt.constants';
import { extractAccessToken } from './access-token-extractor';
import { isAccessJwtPayload } from '../validators/access-jwt-payload.validator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly validateUserUseCase: ValidateUserUseCase,
    @Inject('AuthSessionRepositoryPort')
    private readonly authSessionRepo: AuthSessionRepositoryPort,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: extractAccessToken,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      algorithms: ['HS256'],
      issuer: ACCESS_JWT_ISSUER,
      audience: ACCESS_JWT_AUDIENCE,
    });
  }

  async validate(payload: unknown) {
    if (!isAccessJwtPayload(payload)) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_ACCESS_TOKEN);
    }

    const now = new Date();
    const session = await this.authSessionRepo.findById(payload.sessionId);
    if (!isActiveSessionForUser(session, payload.userId, now)) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_ACCESS_TOKEN);
    }

    const user = await this.validateUserUseCase.execute(payload.userId);
    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_ACCESS_TOKEN);
    }

    if (isSessionActivityDue(session.lastUsedAt, now)) {
      await this.authSessionRepo.recordActivity(session.id, payload.userId, now);
    }

    return { ...user, sessionId: payload.sessionId };
  }
}
