import { OAuthCallback } from '@/views/auth'

interface OAuthCallbackPageProps {
  searchParams: Promise<{ code?: string; error?: string }>
}

export default async function OAuthCallbackRoute({
  searchParams,
}: OAuthCallbackPageProps) {
  const { code, error } = await searchParams

  return <OAuthCallback code={code} error={error} />
}
