import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { ConfigDrawer } from '@/shared/ui/components/config-drawer'
import { sidebarData } from '@/shared/ui/components/layout/data/sidebar-data'
import { Header } from '@/shared/ui/components/layout/header'
import { Main } from '@/shared/ui/components/layout/main'
import { NavUser } from '@/shared/ui/components/layout/nav-user'
import { Search } from '@/shared/ui/components/search'
import { ThemeSwitch } from '@/shared/ui/components/theme-switch'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/components/ui/tabs'
import { ChecklistTodoProvider, AddTaskDialog } from '@/features/task'
import { KanbanTaskBoard } from '@/widgets/kanban-board'

type ViewMode = 'kanban' | 'list'

export function TaskPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <NavUser user={sidebarData.user} />
        </div>
      </Header>
      <Main>
        <ChecklistTodoProvider>
          <div className='mb-2 flex items-center justify-between space-y-2'>
            <div className='flex gap-8'>
              <h1 className='text-2xl font-bold tracking-tight'>Tasks</h1>
              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v as ViewMode)}
              >
                <TabsList>
                  <TabsTrigger value='kanban' className='gap-2'>
                    <LayoutGrid className='h-4 w-4' />
                    Kanban
                  </TabsTrigger>
                  <TabsTrigger value='list' className='gap-2'>
                    <List className='h-4 w-4' />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className='flex items-center space-x-2'>
              <AddTaskDialog />
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1 overflow-hidden'>
            {viewMode === 'kanban' ? <KanbanTaskBoard /> : null}
          </div>
        </ChecklistTodoProvider>
      </Main>
    </>
  )
}

// // List View
// export const TaskList = () => {
//   const tasks = useTaskStore((state) => state.tasks)

//   return (
//     <div className='space-y-2'>
//       {tasks.map((task) => (
//         <TaskCard
//           key={task.id}
//           task={task}
//           variant='list'
//           onTaskClick={(id) => console.log('Clicked:', id)}
//         />
//       ))}
//     </div>
//   )
// }
