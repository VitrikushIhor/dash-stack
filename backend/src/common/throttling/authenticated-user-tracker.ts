import { UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../types/auth-user';

export const getAuthenticatedUserTracker = (request: AuthenticatedRequest): string => {
  if (!request.user) throw new UnauthorizedException();

  return request.user.id;
};
