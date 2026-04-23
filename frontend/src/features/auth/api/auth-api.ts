import {
  clearTokens,
  getRefreshToken,
  setTokens,
} from '@/shared/api/api-helpers'
import { api } from '../../../shared/api/api-client'
import type {
  AuthTokens,
  SignupInput,
  LoginInput,
  User,
} from '../model/types/auth.types'

// Auth API functions
export const authApi = {
  signup: (input: SignupInput): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/signup', input)
  },

  login: async (input: LoginInput): Promise<AuthTokens> => {
    const data = await api.post<AuthTokens>('/auth/login', input)
    setTokens(data.accessToken, data.refreshToken)
    return data
  },

  verifyEmail: async (token: string): Promise<AuthTokens> => {
    const data = await api.post<AuthTokens>('/auth/verify-email', { token })
    setTokens(data.accessToken, data.refreshToken)
    return data
  },

  refreshToken: (): Promise<{ accessToken: string }> => {
    const token = getRefreshToken()
    if (!token) {
      return Promise.reject(new Error('No refresh token available'))
    }
    return api.post<{ accessToken: string }>('/auth/refresh', { token })
  },

  logout: async (): Promise<{ message: string }> => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken })
      } catch {
        // Ignore errors, clear tokens anyway
      }
    }
    clearTokens()
    return { message: 'Logged out successfully' }
  },

  logoutAll: async (): Promise<{ message: string }> => {
    const data = await api.post<{ message: string }>('/auth/logout-all')
    clearTokens()
    return data
  },

  forgotPassword: (email: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/forgot-password', { email })
  },

  resetPassword: (
    token: string,
    password: string
  ): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    })
  },

  oauthExchange: async (token: string): Promise<AuthTokens> => {
    const data = await api.post<AuthTokens>('/auth/oauth/exchange', { token })
    setTokens(data.accessToken, data.refreshToken)
    return data
  },

  getMe: (): Promise<User> => {
    return api.get<User>('/auth/me')
  },
}

export default authApi
