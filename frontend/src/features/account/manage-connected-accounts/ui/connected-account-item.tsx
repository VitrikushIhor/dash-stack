import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'

interface ConnectedAccountItemProps {
  name: string
  connection: string
  connected: boolean
}

export function ConnectedAccountItem({
  name,
  connection,
  connected,
}: ConnectedAccountItemProps) {
  return (
    <div className='flex items-center justify-between gap-4 rounded-lg border p-4'>
      <div>
        <h3 className='font-medium'>{name}</h3>
        <p className='text-muted-foreground text-sm'>
          {connected ? 'Connected' : 'Not connected'}
        </p>
      </div>
      {connected && <span aria-label={`${name} connected`}>Connected</span>}
      {!connected && (
        <form action={ROUTES.oauthStart} method='post'>
          <input type='hidden' name='connection' value={connection} />
          <input
            type='hidden'
            name='returnTo'
            value={ROUTES.settingsAccounts}
          />
          <Button type='submit'>Connect {name}</Button>
        </form>
      )}
    </div>
  )
}
