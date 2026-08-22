import { Sparkles } from 'lucide-react'

export function CatalogHero() {
  return (
    <div className='border-primary/20 from-primary/10 via-card to-background relative overflow-hidden rounded-2xl border bg-linear-to-br p-6 sm:p-8'>
      <div className='relative z-10 max-w-2xl space-y-2'>
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
    </div>
  )
}
