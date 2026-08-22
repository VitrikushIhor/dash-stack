import type { Metadata } from 'next'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { getPublicDecksQuery } from '@/entities/deck/server'
import { vocabCatalogSearchParamsCache } from '@/features/vocab-filters/server'
import { CatalogView } from '@/views/vocab'

export const metadata: Metadata = {
  title: 'Public Deck Catalog | Dash English',
  description: 'Explore community and official CEFR English vocabulary decks.',
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CatalogPage({ searchParams }: Props) {
  const {
    q: rawQ,
    level: rawLevel,
    page,
  } = await vocabCatalogSearchParamsCache.parse(searchParams)

  const q = rawQ ?? undefined
  const level = rawLevel ?? undefined

  const result = await getPublicDecksQuery({
    q,
    level,
    page,
    perPage: 12,
  })

  if (!result.ok) {
    return <PageErrorHandler error={result.error} />
  }

  return (
    <CatalogView initialData={result.data} q={q} level={level} page={page} />
  )
}
