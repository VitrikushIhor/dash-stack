import { ConfigDrawer } from '@/shared/ui/components/config-drawer'
import { sidebarData } from '@/shared/ui/components/layout/data/sidebar-data'
import { Header } from '@/shared/ui/components/layout/header'
import { Main } from '@/shared/ui/components/layout/main'
import { NavUser } from '@/shared/ui/components/layout/nav-user'
import { Search } from '@/shared/ui/components/search'
import { ThemeSwitch } from '@/shared/ui/components/theme-switch'
import { CalendarProvider, DndProviderWrapper } from '@/features/event-calendar'
import { useTaskStore } from '@/features/task'
import { useMemberStore } from '@/features/team'
import { CalendarHeaderSection, CalendarView } from '@/widgets/calendar-view'

export function CalendarPage() {
  const teamMembers = useMemberStore((store) => store.members)
  const tasks = useTaskStore((store) => store.tasks)

  return (
    <CalendarProvider users={teamMembers} events={tasks}>
      <DndProviderWrapper>
        <Header>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <NavUser user={sidebarData.user} />
          </div>
        </Header>
        <Main>
          <CalendarHeaderSection />
          <CalendarView events={tasks} />
        </Main>
      </DndProviderWrapper>
    </CalendarProvider>
  )
}
