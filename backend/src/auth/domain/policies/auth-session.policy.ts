interface AuthSessionState {
  userId: string;
  revokedAt: Date | null;
  expiresAt: Date;
}

export function isActiveSessionForUser(
  session: AuthSessionState | null,
  userId: string,
  now: Date,
): boolean {
  return (
    session !== null &&
    session.userId === userId &&
    session.revokedAt === null &&
    session.expiresAt > now
  );
}
