export interface JwtPayload {
  userId: string;
  sessionId: string;
  tokenUse: 'access';
  iss: string;
  aud: string;
  /**
   * Issued at
   */
  iat: number;
  /**
   * Expiration time
   */
  exp: number;
}
