export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthenticatedRequest {
  user?: AuthUser;
}
