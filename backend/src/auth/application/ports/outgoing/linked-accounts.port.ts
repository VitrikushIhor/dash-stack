export interface LinkedAccountsPort {
  list(userId: string): Promise<string[]>;
  link(userId: string, provider: string, providerAccountId: string): Promise<void>;
}
