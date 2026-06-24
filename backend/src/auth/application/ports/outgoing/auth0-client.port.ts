export interface Auth0UserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

export interface Auth0ClientPort {
  getUserInfo(token: string): Promise<Auth0UserInfo>;
}
