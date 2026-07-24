import '@/entities/session'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface SignUpInput {
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export interface SignInInput {
  email: string
  password: string
}

export enum VerificationStatus {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  MISSING_TOKEN = 'missing-token',
}
