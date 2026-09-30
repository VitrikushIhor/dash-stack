import type { CreateUserData } from './user.repository.port';

export interface OAuthSignupData {
  user: CreateUserData;
  provider: string;
  providerAccountId: string;
}

export interface OAuthSignupTransactionPort {
  create(data: OAuthSignupData): Promise<string>;
}
