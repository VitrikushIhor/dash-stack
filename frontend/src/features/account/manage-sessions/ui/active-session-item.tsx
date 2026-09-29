import Link from 'next/link'
import { Clock3, Monitor, Smartphone, X } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { Badge } from '@/shared/ui/core/badge'
import { Button } from '@/shared/ui/core/button'
import type { ActiveSession } from '../model/types/active-sessions.types'

interface ActiveSessionItemProps {
  session: ActiveSession
  page: number
}

export function ActiveSessionItem({ session, page }: ActiveSessionItemProps) {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(session.userAgent ?? '')
  const DeviceIcon = isMobile ? Smartphone : Monitor

  return (
    <li className='flex flex-wrap items-center gap-4 py-6 sm:flex-nowrap'>
      <div className='bg-muted/60 text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-xl'>
        <DeviceIcon className='size-6' aria-hidden='true' />
      </div>
      <div className='min-w-0 flex-1 space-y-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <h3 className='font-semibold'>
            {isMobile ? 'Mobile session' : 'Browser session'}
          </h3>
          {session.isCurrent && (
            <Badge
              variant='outline'
              className='border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
            >
              Current session
            </Badge>
          )}
        </div>
        <p className='text-muted-foreground flex items-center gap-2 text-sm'>
          <Clock3 className='size-4 shrink-0' aria-hidden='true' />
          Last active:{' '}
          {session.isCurrent ? (
            'Active now'
          ) : (
            <time dateTime={session.lastUsedAt}>
              {new Date(session.lastUsedAt).toLocaleString()}
            </time>
          )}
        </p>
        <p className='text-muted-foreground text-sm'>
          Expires:{' '}
          <time dateTime={session.expiresAt}>
            {new Date(session.expiresAt).toLocaleString()}
          </time>
        </p>
        <p className='text-muted-foreground text-sm wrap-break-word'>
          {session.userAgent || 'Browser details unavailable'}
        </p>
      </div>
      <Button
        variant={session.isCurrent ? 'outline' : 'destructive'}
        size='sm'
        className='ms-16 shrink-0 sm:ms-0'
        asChild
      >
        <Link
          href={`${ROUTES.settingsSessions}?page=${page}&revoke-session=${encodeURIComponent(session.id)}`}
          scroll={false}
          aria-label={
            session.isCurrent ? 'Sign out this session' : 'Sign out session'
          }
        >
          {!session.isCurrent && <X className='size-4' aria-hidden='true' />}
          {session.isCurrent ? 'Sign out' : 'Remove'}
        </Link>
      </Button>
    </li>
  )
}
