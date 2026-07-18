import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import { Loader2 } from 'lucide-react'
import { clearTokens } from '@/shared/api'
import { organizationKeys } from '@/entities/organization/api/organization-query-keys'
import { userApi } from '@/entities/user/api/user-api'
import { authKeys, authApi } from '@/features/auth'

export function OAuthCallback() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated, isLoading, getAccessTokenSilently, user, error } =
    useAuth0()

  useEffect(() => {
    const handleAuth = async () => {
      if (isLoading) return

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Auth0 error:', error)
        clearTokens()
        queryClient.removeQueries({ queryKey: authKeys.user })
        navigate({ to: '/sign-in', replace: true })
        return
      }

      if (isAuthenticated && user) {
        try {
          const auth0Token = await getAccessTokenSilently()

          await authApi.oauthExchange(auth0Token)

          await queryClient.invalidateQueries({ queryKey: authKeys.user })

          const memberships = await queryClient.fetchQuery({
            queryKey: organizationKeys.lists(),
            queryFn: userApi.getMyMemberships,
          })

          if (memberships.length === 0) {
            navigate({ to: '/create-organization', replace: true })
            return
          }

          navigate({ to: '/', replace: true })
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to exchange token:', err)
          clearTokens()
          queryClient.removeQueries({ queryKey: authKeys.user })
          navigate({ to: '/sign-in', replace: true })
        }
      } else if (!isLoading && !isAuthenticated) {
        navigate({ to: '/sign-in', replace: true })
      }
    }

    handleAuth()
  }, [
    isAuthenticated,
    isLoading,
    user,
    error,
    getAccessTokenSilently,
    navigate,
    queryClient,
  ])

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <Loader2 className='text-primary h-12 w-12 animate-spin' />
        <p className='text-muted-foreground'>Completing sign in...</p>
      </div>
    </div>
  )
}
