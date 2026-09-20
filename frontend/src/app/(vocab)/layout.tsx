import type { Metadata } from 'next'
import { getCurrentUser } from '@/entities/user/server'
import { VocabularyHeader } from '@/widgets/vocabulary-header'

export const metadata: Metadata = {
  title: {
    default: 'Vocabulary | Dash English',
    template: '%s | Dash English',
  },
  description: 'Study public English vocabulary decks with spaced repetition.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'Dash English',
    title: 'Vocabulary | Dash English',
    description:
      'Study public English vocabulary decks with spaced repetition.',
  },
  twitter: {
    card: 'summary',
    title: 'Vocabulary | Dash English',
    description:
      'Study public English vocabulary decks with spaced repetition.',
  },
}

export default async function VocabularyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: user } = await getCurrentUser()

  return (
    <div className='bg-background text-foreground min-h-svh'>
      <VocabularyHeader user={user} />
      <main id='main-content'>{children}</main>
    </div>
  )
}
