import type { LinkedAccounts } from '../model/types/linked-accounts.types'
import { ConnectedAccountItem } from './connected-account-item'
import { ConnectedAccountsResult } from './connected-accounts-result'

const PROVIDERS = [
  { name: 'Google', provider: 'google', connection: 'google-oauth2' },
  { name: 'GitHub', provider: 'github', connection: 'github' },
] as const

export function ConnectedAccounts({ data }: { data: LinkedAccounts }) {
  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-lg font-medium'>Connected accounts</h2>
        <p className='text-muted-foreground text-sm'>
          Connect Google or GitHub to sign in to this account. You will confirm
          your provider account before it is connected.
        </p>
      </div>
      <ConnectedAccountsResult />
      <div className='space-y-4'>
        {PROVIDERS.map(({ name, provider, connection }) => (
          <ConnectedAccountItem
            key={provider}
            name={name}
            connection={connection}
            connected={data.providers.includes(provider)}
          />
        ))}
      </div>
    </section>
  )
}
