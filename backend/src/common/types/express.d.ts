import type { AuthUser } from './auth-user';

declare global {
  namespace Express {
    interface User {
      id: AuthUser['id'];
      email: AuthUser['email'];
    }
  }
}

export {};
