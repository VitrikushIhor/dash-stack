import { requireAuthenticatedUser } from '@/entities/user/server'

export default async function OwnerVocabularyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuthenticatedUser()

  return children
}
