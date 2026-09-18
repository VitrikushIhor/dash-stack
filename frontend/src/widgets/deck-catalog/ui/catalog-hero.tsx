import { Sparkles } from 'lucide-react'
import { GradientHeading } from '@/shared/ui/gradient-heading'

export function CatalogHero() {
  return (
    <GradientHeading className='border-primary/20 rounded-2xl border p-6 sm:p-8'>
      <div className='max-w-2xl space-y-2'>
        <div className='border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold'>
          <Sparkles className='h-3.5 w-3.5' />
          <span>Curated Spaced Repetition Catalog</span>
        </div>
        <h1 className='text-2xl font-extrabold tracking-tight sm:text-4xl'>
          Explore Public Vocabulary Decks
        </h1>
        <p className='text-muted-foreground text-sm'>
          Discover community-created and official CEFR decks. Fork any deck into
          your personal collection to customize and study at your own pace.
        </p>
      </div>
    </GradientHeading>
  )
}
