'use client'

import { useEffect, useRef } from 'react'
import { parseAsString, useQueryState } from 'nuqs'
import { toast } from 'sonner'
import {
  OAUTH_LINK_RESULT,
  parseOAuthLinkResult,
} from '@/shared/api/oauth/client'

export function ConnectedAccountsResult() {
  const [link, setLink] = useQueryState('link', parseAsString)
  const handledResult = useRef<string | null>(null)

  useEffect(() => {
    if (!link || handledResult.current === link) return

    const result = parseOAuthLinkResult(link)
    if (!result) return

    let cancelled = false

    queueMicrotask(() => {
      if (cancelled || handledResult.current === link) return

      handledResult.current = link
      if (result === OAUTH_LINK_RESULT.SUCCESS) {
        toast.success(
          'Your account is connected. You can now use it to sign in.'
        )
      } else {
        toast.error(
          'Could not connect this account. It may already be connected to another user, or the confirmation expired. Try again.'
        )
      }
      void setLink(null)
    })

    return () => {
      cancelled = true
    }
  }, [link, setLink])

  return null
}
