import 'server-only'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { getPublicDecksQuery } from '@/entities/deck/server'
import { getCurrentUser } from '@/entities/user/server'
import { vocabCatalogSearchParamsCache } from '@/features/vocab-filters/server'
import { PublicDeckCatalog } from '@/widgets/deck-catalog'

type CatalogPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function CatalogPage({ searchParams }: CatalogPageProps) {
  const {
    q: rawQ,
    level: rawLevel,
    language: rawLanguage,
    tags,
    page,
  } = await vocabCatalogSearchParamsCache.parse(searchParams)
  const [result, currentUser] = await Promise.all([
    getPublicDecksQuery({
      q: rawQ ?? undefined,
      level: rawLevel ?? undefined,
      language: rawLanguage ?? undefined,
      tags,
      page,
      perPage: 12,
    }),
    getCurrentUser(),
  ])

  if (!result.ok) return <PageErrorHandler error={result.error} />

  return (
    <main className='container mx-auto max-w-7xl px-4 py-6 sm:px-6'>
      <PublicDeckCatalog
        initialData={result.data}
        currentQuery={rawQ ?? undefined}
        currentLevel={rawLevel ?? undefined}
        currentLanguage={rawLanguage ?? undefined}
        currentTags={tags}
        currentPage={page}
        isAuthenticated={currentUser.data != null}
      />
    </main>
  )
}
