import { Trophy } from 'lucide-react'
import { formatTime } from '@/shared/lib/utils'
import { type MatchLeaderboard as MatchLeaderboardData } from '@/entities/vocab'

export function MatchLeaderboard({ board }: { board: MatchLeaderboardData }) {
  return (
    <section
      aria-labelledby='match-leaderboard-title'
      className='mx-auto mt-8 w-full max-w-xl'
    >
      <h2
        id='match-leaderboard-title'
        className='mb-3 flex items-center gap-2 text-xl font-semibold'
      >
        <Trophy aria-hidden='true' className='size-5' /> Leaderboard
      </h2>
      {board.currentUserBest && (
        <p className='bg-muted mb-3 rounded-md px-3 py-2 text-sm'>
          Your best:{' '}
          <strong>{formatTime(board.currentUserBest.durationMs)}</strong>
        </p>
      )}
      {board.data.length === 0 ? (
        <p className='text-muted-foreground text-sm'>No completed games yet.</p>
      ) : (
        <ol className='divide-y rounded-md border'>
          {board.data.map((entry, index) => {
            const name =
              [entry.user.firstName, entry.user.lastName]
                .filter(Boolean)
                .join(' ') || 'Learner'

            return (
              <li
                key={entry.id}
                className='flex items-center justify-between gap-4 px-4 py-3'
              >
                <span>
                  <span className='text-muted-foreground mr-3'>
                    {(board.meta.currentPage - 1) * board.meta.perPage +
                      index +
                      1}
                    .
                  </span>
                  {name}
                </span>
                <span className='font-mono font-medium'>
                  {formatTime(entry.durationMs)}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
