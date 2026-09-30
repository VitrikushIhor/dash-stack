export interface LinkOAuthAccountCommand {
  userId: string;
  code: string;
  codeVerifier: string;
  provider: string;
}
