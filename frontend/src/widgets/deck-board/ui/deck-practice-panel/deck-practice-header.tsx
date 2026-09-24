import { Sparkles } from 'lucide-react'

export const DeckPracticeHeader = () => {
  return (
    <div className='mb-5 flex items-center gap-3'>
      <div className='bg-primary/10 text-primary rounded-lg p-2'>
        <Sparkles />
      </div>

      <div>
        <h2 className='font-semibold'>Practice this deck</h2>

        <p className='text-muted-foreground text-sm'>
          Choose cards, then start a session
        </p>
      </div>
    </div>
  )
}
