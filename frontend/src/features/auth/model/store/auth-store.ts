import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getAccessToken } from '@/shared/api'
import { type User, sessionApi } from '@/entities/session'
import { authApi } from '../../api/auth-api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  checkAuth: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          await authApi.login({ email, password })
          // Fetch user data after successful login
          await get().fetchUser()
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authApi.logout()
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      fetchUser: async () => {
        const token = getAccessToken()
        if (!token) {
          set({ user: null, isAuthenticated: false })
          return
        }

        set({ isLoading: true })
        try {
          const user = await sessionApi.getMe()
          set({
            user,
            isAuthenticated: true,
          })
        } catch {
          set({
            user: null,
            isAuthenticated: false,
          })
        } finally {
          set({ isLoading: false })
        }
      },

      checkAuth: () => {
        const token = getAccessToken()
        const currentState = get()

        if (token && !currentState.user) {
          // Token exists but no user data, fetch it
          get().fetchUser()
        }

        return !!token
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
