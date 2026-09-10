import type { Metadata } from 'next'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { getPublicDecksQuery } from '@/entities/deck/server'
import { vocabCatalogSearchParamsCache } from '@/features/vocab-filters/server'
import { PublicDeckCatalog } from '@/widgets/deck-catalog'

export const metadata: Metadata = {
  title: 'Public Deck Catalog',
  description: 'Explore community and official CEFR English vocabulary decks.',
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CatalogPage({ searchParams }: Props) {
  const {
    q: rawQ,
    level: rawLevel,
    language: rawLanguage,
    tags,
    page,
  } = await vocabCatalogSearchParamsCache.parse(searchParams)
  const result = await getPublicDecksQuery({
    q: rawQ ?? undefined,
    level: rawLevel ?? undefined,
    language: rawLanguage ?? undefined,
    tags,
    page,
    perPage: 12,
  })

  if (!result.ok) {
    return <PageErrorHandler error={result.error} />
  }

  return (
    <main className='container mx-auto max-w-7xl px-4 py-6 sm:px-6'>
      <PublicDeckCatalog
        initialData={result.data}
        currentQuery={rawQ ?? undefined}
        currentLevel={rawLevel ?? undefined}
        currentLanguage={rawLanguage ?? undefined}
        currentTags={tags}
        currentPage={page}
      />
    </main>
  )
}
