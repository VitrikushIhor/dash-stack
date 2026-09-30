export interface OAuthRouteConfig {
  appUrl: URL
  apiUrl: string
  auth0Domain?: string
  auth0ClientId?: string
}

export interface OAuthAuthorization {
  url: URL
  state: string
  verifier: string
}
