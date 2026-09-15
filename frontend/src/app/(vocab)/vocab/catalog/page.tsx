import type { Metadata } from 'next'
import { CatalogPage } from '@/views/vocab/server'

export const metadata: Metadata = {
  title: 'Public Deck Catalog',
  description: 'Explore community and official CEFR English vocabulary decks.',
}

export default CatalogPage
