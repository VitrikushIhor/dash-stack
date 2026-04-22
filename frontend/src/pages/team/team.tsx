import { useState } from 'react'
import { ConfigDrawer } from '@/shared/ui/components/config-drawer'
import { Search } from '@/shared/ui/components/search'
import { ThemeSwitch } from '@/shared/ui/components/theme-switch'
import { Button } from '@/shared/ui/components/ui/button'
import { useMemberStore, AddMemberDialog, TeamGrid } from '@/features/team'
import { sidebarData } from '@/widgets/layout/ui/data/sidebar-data'
import { Header } from '@/widgets/layout/ui/header'
import { Main } from '@/widgets/layout/ui/main'
import { NavUser } from '@/widgets/layout/ui/nav-user'

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
