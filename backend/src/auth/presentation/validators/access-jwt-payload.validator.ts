import type { JwtPayload } from '../../shared/types/jwt-payload.type';
import {
  ACCESS_JWT_AUDIENCE,
  ACCESS_JWT_ISSUER,
  ACCESS_JWT_USE,
} from '../../shared/constants/access-jwt.constants';

export function isAccessJwtPayload(payload: unknown): payload is JwtPayload {
  if (typeof payload !== 'object' || payload === null) return false;

  return (
    'userId' in payload &&
    typeof payload.userId === 'string' &&
    payload.userId.length > 0 &&
    'sessionId' in payload &&
    typeof payload.sessionId === 'string' &&
    payload.sessionId.length > 0 &&
    'tokenUse' in payload &&
    payload.tokenUse === ACCESS_JWT_USE &&
    'iss' in payload &&
    payload.iss === ACCESS_JWT_ISSUER &&
    'aud' in payload &&
    payload.aud === ACCESS_JWT_AUDIENCE &&
    'iat' in payload &&
    typeof payload.iat === 'number' &&
    Number.isFinite(payload.iat) &&
    'exp' in payload &&
    typeof payload.exp === 'number' &&
    Number.isFinite(payload.exp)
  );
}
