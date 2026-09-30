import { ROUTES } from '@/shared/config'
import { EmptyState } from '@/shared/ui/feedback'
import { PaginationControls } from '@/shared/ui/pagination-controls'
import type { ActiveSessions } from '../model/types/active-sessions.types'
import { ActiveSessionItem } from './active-session-item'

interface ActiveSessionsListProps {
  data: ActiveSessions
  page: number
}

export function ActiveSessionsList({ data, page }: ActiveSessionsListProps) {
  return (
    <>
      {data.data.length === 0 && (
        <EmptyState title='No active sessions on this page.' />
      )}
      <ul className='divide-y'>
        {data.data.map((session) => (
          <ActiveSessionItem key={session.id} session={session} page={page} />
        ))}
      </ul>
      <nav
        aria-label='Session pages'
        className='text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-sm'
      >
        <span>
          Page {data.meta.currentPage} of {data.meta.lastPage}
        </span>
        <PaginationControls
          mode='links'
          previousHref={
            data.meta.prev
              ? `${ROUTES.settingsSessions}?page=${data.meta.prev}`
              : null
          }
          nextHref={
            data.meta.next !== null
              ? `${ROUTES.settingsSessions}?page=${data.meta.next}`
              : null
          }
        />
      </nav>
    </>
  )
}
