export interface CreateRefreshTokenData {
  userId: string;
  token: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface RefreshTokenModel {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface RefreshTokenRepositoryPort {
  findByToken(token: string): Promise<RefreshTokenModel | null>;
  create(data: CreateRefreshTokenData): Promise<RefreshTokenModel>;
  deleteById(id: string): Promise<RefreshTokenModel>;
  deleteByToken(token: string): Promise<{ count: number }>;
  deleteAllByUserId(userId: string): Promise<{ count: number }>;
}
