import { useState } from 'react'
import { ConfigDrawer } from '@/shared/ui/components/config-drawer'
import { sidebarData } from '@/shared/ui/components/layout/data/sidebar-data'
import { Header } from '@/shared/ui/components/layout/header'
import { Main } from '@/shared/ui/components/layout/main'
import { NavUser } from '@/shared/ui/components/layout/nav-user'
import { Search } from '@/shared/ui/components/search'
import { ThemeSwitch } from '@/shared/ui/components/theme-switch'
import { Button } from '@/shared/ui/components/ui/button'
import { useMemberStore, AddMemberDialog, TeamGrid } from '@/features/team'

export function TeamPage() {
  const [isMember, setIsMember] = useState<boolean>(false)
  const teamMembers = useMemberStore((store) => store.members)
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <NavUser user={sidebarData.user} />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Team Members</h1>
          <div className='flex items-center space-x-2'>
            <Button
              variant={'outline'}
              type='button'
              onClick={() => setIsMember(true)}
            >
              Add new member
            </Button>
          </div>
        </div>

        <TeamGrid members={teamMembers} />
      </Main>

      <AddMemberDialog open={isMember} onOpenChange={setIsMember} />
    </>
  )
}
