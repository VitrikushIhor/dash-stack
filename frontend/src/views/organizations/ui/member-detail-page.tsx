import { WidgetErrorState } from '@/shared/ui/feedback'
import { MemberDetailView } from '@/entities/organization'
import { getMember } from '@/entities/organization/server'
import { Main } from '@/widgets/layout'
import { MemberNotFoundState } from './member-not-found-state'

interface MemberDetailPageProps {
  slug: string
  userId: string
}

export async function MemberDetailPage({
  slug,
  userId,
}: MemberDetailPageProps) {
  const result = await getMember({ slug, userId })

  if (!result.ok) {
    return (
      <Main>
        <WidgetErrorState
          title='Failed to load member'
          description={result.error.message}
        />
      </Main>
    )
  }

  if (!result.data) {
    return (
      <Main>
        <MemberNotFoundState slug={slug} />
      </Main>
    )
  }

  return (
    <Main>
      <MemberDetailView membership={result.data} slug={slug} />
    </Main>
  )
}
