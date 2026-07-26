import { useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { userApi } from '@/entities/user/api/user-api'
import { extractOAuthToken } from '../../lib/oauth-token-extractor'
import { oauthExchangeAction } from '../mutations/auth-actions'

interface UseOAuthCallbackProps {
  code: string | null
  error: string | null
}

export function useOAuthCallback({ code, error }: UseOAuthCallbackProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const hasHandledRef = useRef(false)

  useEffect(() => {
    if (hasHandledRef.current) return
    hasHandledRef.current = true

    if (error) {
      toast.error(`Authentication failed: ${error}`)
      router.replace('/sign-in')
      return
    }

    const token = extractOAuthToken({ code, error })

    if (!token) {
      router.replace('/sign-in')
      return
    }

    startTransition(async () => {
      try {
        await oauthExchangeAction(token)
        toast.success('Successfully signed in!')

        let memberships: { organization: { id: string } }[] | null = null
        try {
          memberships = await userApi.getMyMemberships()
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(
            'Failed to fetch memberships during OAuth callback:',
            err
          )
        }

        if (memberships !== null && memberships.length === 0) {
          router.replace('/create-organization')
          return
        }

        router.replace('/dashboard')
      } catch (err) {
        handleServerError(err)
        router.replace('/sign-in')
      }
    })
  }, [code, error, router])
}
