import { createFileRoute } from '@tanstack/react-router'
import { OAuthCallback } from '@/pages/auth'

export const Route = createFileRoute('/oauth/callback')({
  component: OAuthCallback,
})
