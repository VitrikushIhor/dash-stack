import { WidgetErrorState } from '@/shared/ui/feedback'
import { getMember } from '@/entities/organization/server'
import { MemberDetailView } from '@/features/organization'
import { Main } from '@/widgets/layout'
import { MemberNotFoundState } from './member-not-found-state'

interface MemberDetailPageProps {
  orgId: string
  userId: string
}

export async function MemberDetailPage({
  orgId,
  userId,
}: MemberDetailPageProps) {
  const { data, error } = await getMember({ orgId, userId })

  if (error) {
    return (
      <Main>
        <WidgetErrorState title='Failed to load member' description={error} />
      </Main>
    )
  }

  if (!data) {
    return (
      <Main>
        <MemberNotFoundState orgId={orgId} />
      </Main>
    )
  }

  return (
    <Main>
      <MemberDetailView membership={data} orgId={orgId} />
    </Main>
  )
}
