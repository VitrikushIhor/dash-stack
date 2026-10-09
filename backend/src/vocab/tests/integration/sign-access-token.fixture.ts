import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_JWT_AUDIENCE,
  ACCESS_JWT_ISSUER,
  ACCESS_JWT_USE,
} from '../../../auth/shared/constants/access-jwt.constants';

export function signAccessTokenFixture(jwt: JwtService, userId: string, sessionId: string): string {
  return jwt.sign(
    { userId, sessionId, tokenUse: ACCESS_JWT_USE },
    {
      algorithm: 'HS256',
      expiresIn: '1m',
      issuer: ACCESS_JWT_ISSUER,
      audience: ACCESS_JWT_AUDIENCE,
    },
  );
}
