import type { User } from '@/entities/user'

export interface Session {
  user: User
  isAuthenticated: boolean
}

export interface SessionState {
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}
