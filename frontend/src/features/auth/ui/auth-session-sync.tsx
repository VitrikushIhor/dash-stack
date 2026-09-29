'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { OAUTH_SESSION_CHANGE } from '@/shared/api/oauth/client'
import { ROUTES } from '@/shared/config'
import {
  AUTH_SESSION_EVENT_KEY,
  AUTH_SESSION_EVENT_KIND,
  parseAuthSessionEvent,
  publishAuthSessionEvent,
  readAuthSessionEvent,
} from '@/shared/lib/auth-session-events'

export function AuthSessionSync({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [navigating, setNavigating] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    if (
      url.searchParams.get(OAUTH_SESSION_CHANGE.QUERY_KEY) ===
      OAUTH_SESSION_CHANGE.QUERY_VALUE
    ) {
      url.searchParams.delete(OAUTH_SESSION_CHANGE.QUERY_KEY)
      window.history.replaceState(window.history.state, '', url)
      queryClient.clear()
      publishAuthSessionEvent(AUTH_SESSION_EVENT_KIND.SIGNED_IN)
    }

    let lastSeen = readAuthSessionEvent()

    const handleChange = (value: string | null) => {
      if (!value || value === lastSeen) return
      lastSeen = value
      const event = parseAuthSessionEvent(value)
      if (!event) return

      queryClient.clear()
      setNavigating(true)
      window.location.replace(
        event.kind === AUTH_SESSION_EVENT_KIND.SIGNED_OUT
          ? ROUTES.signIn
          : ROUTES.vocabDecks
      )
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_SESSION_EVENT_KEY) handleChange(event.newValue)
    }
    const handlePageShow = () => {
      handleChange(readAuthSessionEvent())
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('pageshow', handlePageShow)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [queryClient])

  return navigating ? null : children
}
