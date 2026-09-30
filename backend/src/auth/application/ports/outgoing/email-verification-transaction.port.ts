export interface CompleteEmailVerificationData {
  tokenId: string;
  tokenHash: string;
  email: string;
  credentialHash: string;
  sessionExpiresAt: Date;
  now: Date;
}

export interface CompletedEmailVerification {
  userId: string;
  sessionId: string;
}

export interface EmailVerificationTransactionPort {
  complete(data: CompleteEmailVerificationData): Promise<CompletedEmailVerification | null>;
}
