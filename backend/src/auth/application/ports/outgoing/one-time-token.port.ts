export interface OneTimeToken {
  raw: string;
  hash: string;
}

export interface OneTimeTokenPort {
  create(): OneTimeToken;
  hash(rawToken: string): string;
}
