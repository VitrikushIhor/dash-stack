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
  useTaskStore,
  useTasks,
  TasksDialogs,
} from '@/features/task'
import { KanbanTaskBoard, KanbanViewMode } from '@/widgets/kanban-board'
import { TasksTable, useTasksTable } from '@/widgets/tasks-table'
import { DataTableToolbar } from '@/shared/ui/components/data-table/toolbar'


export function TaskPage() {
  const [viewMode, setViewMode] = useState<KanbanViewMode>(KanbanViewMode.Kanban)
  const tasks = useTaskStore((state) => state.tasks)
  const { setOpen } = useTasks()
  const { table, filterOptions } = useTasksTable({ data: tasks })

  const filteredTasks = table.getFilteredRowModel().rows.map((row) => row.original)

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
      <Main className='flex flex-col gap-4'>
          <div className='flex items-center gap-2 flex-wrap justify-between'>
            <div className='flex gap-8 flex-wrap'>
              <h1 className='text-2xl font-bold tracking-tight'>Tasks</h1>
              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v as KanbanViewMode)}
              >
                <TabsList>
                  <TabsTrigger value={KanbanViewMode.Kanban} className='gap-2'>
                    <LayoutGrid className='h-4 w-4' />
                    Kanban
                  </TabsTrigger>
                  <TabsTrigger value={KanbanViewMode.List} className='gap-2'>
                    <List className='h-4 w-4' />
                    List
                  </TabsTrigger>
                  <TabsTrigger value={KanbanViewMode.Table} className='gap-2'>
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

          <DataTableToolbar
            filterVariant={viewMode !== KanbanViewMode.Table ? 'compact' : 'default'}
            table={table}
            searchPlaceholder='Filter by title or desc...'
            filters={[
              {
                columnId: 'status',
                title: 'Status',
                options: filterOptions.statuses,
              },
              {
                columnId: 'assignedLabels',
                title: 'Label',
                options: filterOptions.labels,
              },
              {
                columnId: 'assignedMembers',
                title: 'Members',
                options: filterOptions.members,
              },
            ]}
            dateFilters={[
              {
                columnId: 'deadline',
                title: 'Deadline',
                type: 'range',
              },
            ]}
            hideTableViewOptions={viewMode !== KanbanViewMode.Table}
          />

          {/* Main Content */}
          <div className='flex-1 overflow-hidden'>
            {viewMode === KanbanViewMode.Table ? (
              <TasksTable table={table} />
            ) : (
              <KanbanTaskBoard viewMode={viewMode} tasks={filteredTasks} />
            )}
          </div>
      </Main>
      <TasksDialogs />
    </>
  )
}
