import { OAuthCallbackCard } from '@/features/auth'

interface OAuthCallbackProps {
  code?: string
  error?: string
}

export function OAuthCallback({ code, error }: OAuthCallbackProps) {
  return <OAuthCallbackCard code={code} error={error} />
}
