import { ShieldCheck } from 'lucide-react'
import type { ActiveSessions as ActiveSessionsData } from '../model/types/active-sessions.types'
import { ActiveSessionsList } from './active-sessions-list'
import { RevokeSessionDialog } from './revoke-session-dialog'

interface ActiveSessionsProps {
  data: ActiveSessionsData
  page: number
}

export function ActiveSessions({ data, page }: ActiveSessionsProps) {
  return (
    <section
      className='bg-card text-card-foreground space-y-6 rounded-2xl border p-5 sm:p-8'
      aria-labelledby='active-sessions-heading'
    >
      <div className='flex items-start gap-3 border-b pb-6'>
        <div className='bg-muted flex size-12 shrink-0 items-center justify-center rounded-xl'>
          <ShieldCheck className='size-6' aria-hidden='true' />
        </div>
        <div className='space-y-1'>
          <h2
            id='active-sessions-heading'
            className='text-xl font-semibold tracking-tight sm:text-2xl'
          >
            Active sessions
          </h2>
          <p className='text-muted-foreground text-sm'>
            Manage and monitor devices that have access to your account.
          </p>
        </div>
      </div>
      <ActiveSessionsList data={data} page={page} />
      <aside className='bg-muted/30 flex items-start gap-3 rounded-xl border p-4'>
        <ShieldCheck
          className='text-primary mt-0.5 size-4 shrink-0'
          aria-hidden='true'
        />
        <div className='space-y-1'>
          <h3 className='text-sm font-medium'>Security tip</h3>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            If you notice an unfamiliar session, sign it out and change your
            password. A device can have more than one session.
          </p>
        </div>
      </aside>
      <RevokeSessionDialog sessions={data.data} />
    </section>
  )
}
