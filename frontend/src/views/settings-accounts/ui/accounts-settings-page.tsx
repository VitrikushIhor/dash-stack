import { PageErrorHandler } from '@/shared/ui/error-state'
import { requireAuthenticatedUser } from '@/entities/user/server'
import { ConnectedAccounts } from '@/features/account/manage-connected-accounts'
import { getLinkedAccountsQuery } from '@/features/account/manage-connected-accounts/server'

export async function AccountsSettingsPage() {
  await requireAuthenticatedUser()
  const result = await getLinkedAccountsQuery()

  if (!result.ok)
    return <PageErrorHandler error={result.error} withContainer={false} />

  return <ConnectedAccounts data={result.data} />
}
