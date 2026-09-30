export interface CreateAuthSessionData {
  userId: string;
  credentialHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthSessionModel {
  id: string;
  userId: string;
  credentialHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  lastUsedAt: Date;
}

export interface AuthSessionRepositoryPort {
  recordActivity(id: string, userId: string, now: Date): Promise<void>;
  create(data: CreateAuthSessionData): Promise<AuthSessionModel>;
  findByCredentialHash(credentialHash: string): Promise<AuthSessionModel | null>;
  findById(id: string): Promise<AuthSessionModel | null>;
  revokeByCredentialHash(credentialHash: string, revokedAt: Date): Promise<{ count: number }>;
  revokeAllByUserId(userId: string, revokedAt: Date): Promise<{ count: number }>;
}
