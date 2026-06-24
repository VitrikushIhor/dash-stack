export interface CreateAccountData {
  userId: string;
  provider: string;
  providerAccountId: string;
}

export interface AccountWithUserModel {
  user: {
    id: string;
    email: string;
  };
}

export interface AccountRepositoryPort {
  findByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<AccountWithUserModel | null>;
  create(data: CreateAccountData): Promise<unknown>;
}
