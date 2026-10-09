import 'server-only'
import { createServerApiClient } from '@/shared/api/server'
import { persistAuthCookies } from '@/shared/api/session/persist-auth-cookies'
import { linkedAccountsSchema } from '../model/schema/linked-accounts.schema'

const accountsHttpClient = createServerApiClient(persistAuthCookies)

export const connectedAccountsServerApi = {
  linkedAccounts: async () =>
    linkedAccountsSchema.parse(
      await accountsHttpClient.get<unknown>('/auth/accounts')
    ),
}
