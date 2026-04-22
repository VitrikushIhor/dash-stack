export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  avatar: string | null
  emailVerified: string | null
  createdAt: string
  updatedAt: string
}

export interface SignupInput {
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export interface LoginInput {
  email: string
  password: string
}

export enum VerificationStatus {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}
