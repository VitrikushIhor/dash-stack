export interface SessionCredential {
  raw: string;
  hash: string;
}

export interface SessionCredentialPort {
  create(): SessionCredential;
  hash(rawCredential: string): string;
}
