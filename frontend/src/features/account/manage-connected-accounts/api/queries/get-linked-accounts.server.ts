import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { connectedAccountsServerApi } from '../connected-accounts-api.server'

export const getLinkedAccountsQuery = cache(
  createServerQuery(
    'getLinkedAccountsQuery',
    connectedAccountsServerApi.linkedAccounts
  )
)
