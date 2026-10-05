import { formatTime } from '@/shared/lib/utils'

export function MatchSummary({ durationMs }: { durationMs: number }) {
  return (
    <div className='bg-muted/50 mb-8 w-full rounded-xl p-6'>
      <div className='text-muted-foreground mb-1 text-sm font-medium'>
        Completion Time
      </div>
      <div className='text-primary font-mono text-4xl font-extrabold'>
        {formatTime(durationMs)}s
      </div>
    </div>
  )
}
