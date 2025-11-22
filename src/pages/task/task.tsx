import { useState } from 'react'
import { LayoutGrid, List, Plus } from 'lucide-react'
import { ConfigDrawer } from '@/shared/ui/components/config-drawer'
import { sidebarData } from '@/shared/ui/components/layout/data/sidebar-data'
import { Header } from '@/shared/ui/components/layout/header'
import { Main } from '@/shared/ui/components/layout/main'
import { NavUser } from '@/shared/ui/components/layout/nav-user'
import { Search } from '@/shared/ui/components/search'
import { ThemeSwitch } from '@/shared/ui/components/theme-switch'
import { Button } from '@/shared/ui/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/components/ui/tabs'
import {
  ChecklistTodoProvider,
  useTaskStore,
  useTasks,
  TasksDialogs,
} from '@/features/task'
import { KanbanTaskBoard } from '@/widgets/kanban-board'
import { TasksTable } from '@/widgets/tasks-table'

type ViewMode = 'kanban' | 'list'

export function TaskPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const tasks = useTaskStore((state) => state.tasks)
  const { setOpen } = useTasks()

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
                  <TabsTrigger value='table' className='gap-2'>
                    <List className='h-4 w-4' />
                    Table
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className='flex items-center space-x-2'>
              <Button onClick={() => setOpen('create')}>
                <Plus className='mr-2 h-4 w-4' />
                Add Task
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1 overflow-hidden'>
            {viewMode === 'kanban' || viewMode === 'list' ? (
              <KanbanTaskBoard viewMode={viewMode} />
            ) : (
              <TasksTable data={tasks} />
            )}
          </div>
        </ChecklistTodoProvider>
      </Main>
      <TasksDialogs />
    </>
  )
}
