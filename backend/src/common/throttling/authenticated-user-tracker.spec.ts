import { UnauthorizedException } from '@nestjs/common';
import { getAuthenticatedUserTracker } from './authenticated-user-tracker';

describe('getAuthenticatedUserTracker', () => {
  it('should_return_authenticated_user_id', () => {
    const request = { user: { id: 'user-1', email: 'user@example.com' } };

    expect(getAuthenticatedUserTracker(request)).toBe('user-1');
  });

  it('should_throw_when_request_has_no_authenticated_user', () => {
    expect(() => getAuthenticatedUserTracker({})).toThrow(UnauthorizedException);
  });
});
