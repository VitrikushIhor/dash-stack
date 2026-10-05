import { type FlashcardResult } from '../../model/shared/types'

export function FlashcardsSummary({ results }: { results: FlashcardResult[] }) {
  const total = results.length
  const correctCount = results.filter((result) => result.isCorrect).length
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 100
  return (
    <div className='mb-8 grid w-full grid-cols-2 gap-4'>
      <div className='bg-muted/50 rounded-xl p-4'>
        <div className='text-muted-foreground mb-1 text-sm font-medium'>
          Accuracy
        </div>
        <div className='text-3xl font-bold text-green-600'>{percentage}%</div>
      </div>
      <div className='bg-muted/50 rounded-xl p-4'>
        <div className='text-muted-foreground mb-1 text-sm font-medium'>
          Score
        </div>
        <div className='text-3xl font-bold'>
          {correctCount} / {total}
        </div>
      </div>
    </div>
  )
}
