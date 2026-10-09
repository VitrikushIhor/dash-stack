export interface CompletePasswordResetData {
  tokenId: string;
  tokenHash: string;
  email: string;
  hashedPassword: string;
  now: Date;
}

export interface PasswordResetTransactionPort {
  complete(data: CompletePasswordResetData): Promise<boolean>;
}
