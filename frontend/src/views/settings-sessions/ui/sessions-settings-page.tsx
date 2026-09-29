import { PageErrorHandler } from '@/shared/ui/error-state'
import { requireAuthenticatedUser } from '@/entities/user/server'
import { ActiveSessions } from '@/features/account/manage-sessions'
import { getActiveSessionsQuery } from '@/features/account/manage-sessions/server'

interface SessionsSettingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function SessionsSettingsPage({
  searchParams,
}: SessionsSettingsPageProps) {
  await requireAuthenticatedUser()
  const result = await getActiveSessionsQuery(await searchParams)

  if (!result.ok) {
    return <PageErrorHandler error={result.error} withContainer={false} />
  }

  return <ActiveSessions data={result.data.sessions} page={result.data.page} />
}
