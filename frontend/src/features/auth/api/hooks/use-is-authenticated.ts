import { useCurrentUser } from './use-current-user'

export function useIsAuthenticated() {
  const { data: user, isLoading } = useCurrentUser()
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  }
}
