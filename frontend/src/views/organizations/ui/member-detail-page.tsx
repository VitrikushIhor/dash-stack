'use client'

import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/shared/config/constants/routes'
import { ConfigDrawer } from '@/shared/ui/config-drawer'
import { Button } from '@/shared/ui/core/button'
import { Search } from '@/shared/ui/search'
import { ThemeSwitch } from '@/shared/ui/theme-switch'
import { useGetMember } from '@/entities/organization'
import { MemberDetailView } from '@/features/organization'
import { Header, Main, NavUser } from '@/widgets/layout'

interface MemberDetailPageProps {
  orgId: string
  userId: string
}

export function MemberDetailPage({ orgId, userId }: MemberDetailPageProps) {
  const { data: membership, isLoading, isError } = useGetMember(orgId, userId)

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <NavUser />
        </div>
      </Header>

      <Main>
        {isLoading ? (
          <div className='flex h-[50vh] items-center justify-center'>
            <Loader2 className='text-primary h-8 w-8 animate-spin' />
          </div>
        ) : isError || !membership ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <h1 className='text-2xl font-bold'>Member not found</h1>
            <p className='text-muted-foreground mt-1 mb-4 text-sm'>
              The member you are looking for does not exist in this
              organization.
            </p>
            <Button asChild>
              <Link href={`${ROUTES.organizations}/${orgId}`}>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Organization
              </Link>
            </Button>
          </div>
        ) : (
          <MemberDetailView membership={membership} orgId={orgId} />
        )}
      </Main>
    </>
  )
}
