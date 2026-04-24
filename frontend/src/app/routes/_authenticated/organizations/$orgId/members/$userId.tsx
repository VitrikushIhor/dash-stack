import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui/components/ui/button'
import { useGetMember, MemberDetailView } from '@/features/organization'

export const Route = createFileRoute(
  '/_authenticated/organizations/$orgId/members/$userId'
)({
  component: MemberDetailPage,
})

function MemberDetailPage() {
  const { orgId, userId } = useParams({
    from: '/_authenticated/organizations/$orgId/members/$userId',
  })

  const { data: membership, isLoading } = useGetMember(orgId, userId)

  if (isLoading) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <Loader2 className='text-primary h-8 w-8 animate-spin' />
      </div>
    )
  }

  if (!membership) {
    return (
      <div className='flex h-[400px] flex-col items-center justify-center gap-4'>
        <p className='text-muted-foreground'>Member not found</p>
        <Link to='/organizations/$orgId/members' params={{ orgId }}>
          <Button variant='outline' size='sm'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Members
          </Button>
        </Link>
      </div>
    )
  }

  return <MemberDetailView membership={membership} orgId={orgId} />
}
