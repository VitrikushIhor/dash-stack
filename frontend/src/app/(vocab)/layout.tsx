import type { Metadata } from 'next'

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

export default function VocabularyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <main id='main-content'>{children}</main>
}
