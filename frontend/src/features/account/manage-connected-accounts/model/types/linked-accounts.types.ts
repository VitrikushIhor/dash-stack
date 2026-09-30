import type { z } from 'zod'
import type { linkedAccountsSchema } from '../schema/linked-accounts.schema'

export type LinkedAccounts = z.infer<typeof linkedAccountsSchema>
