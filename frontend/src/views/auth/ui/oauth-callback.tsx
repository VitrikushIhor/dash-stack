'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { tokenStorage } from '@/shared/api'
import { organizationKeys } from '@/entities/organization/api/organization-query-keys'
import { userApi } from '@/entities/user/api/user-api'
import { authKeys, authApi } from '@/features/auth'

export function OAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  useEffect(() => {
    const handleAuth = async () => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error('OAuth error:', error)
        await tokenStorage.clearTokens()
        queryClient.removeQueries({ queryKey: authKeys.user })
        router.replace('/sign-in')
        return
      }

      if (code) {
        try {
          await authApi.oauthExchange(code)
          await queryClient.invalidateQueries({ queryKey: authKeys.user })

          const memberships = await queryClient.fetchQuery({
            queryKey: organizationKeys.lists(),
            queryFn: userApi.getMyMemberships,
          })

          if (memberships.length === 0) {
            router.replace('/create-organization')
            return
          }
          router.replace('/dashboard')
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to exchange token:', err)
          await tokenStorage.clearTokens()
          queryClient.removeQueries({ queryKey: authKeys.user })
          router.replace('/sign-in')
        }
      } else {
        router.replace('/sign-in')
      }
    }

    handleAuth()
  }, [code, error, router, queryClient])

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <Loader2 className='text-primary h-12 w-12 animate-spin' />
        <p className='text-muted-foreground'>Completing sign in...</p>
      </div>
    </div>
  )
}
