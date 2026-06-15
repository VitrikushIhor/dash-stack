import { useState, useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { LayoutGrid, List, Plus } from 'lucide-react'
import {
  ConfigDrawer,
  DataTableToolbar,
  Search,
  ThemeSwitch,
} from '@/shared/ui'
import { Button } from '@/shared/ui/core/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/core/tabs'
import { useTasksQuery } from '@/entities/task'
import { useTaskModalStore } from '@/features/manage-task'
import { useOrgStore } from '@/features/organization'
import { KanbanTaskBoard, KanbanViewMode } from '@/widgets/kanban-board'
import { Header } from '@/widgets/layout/ui/header'
import { Main } from '@/widgets/layout/ui/main'
import { NavUser } from '@/widgets/layout/ui/nav-user'
import { TasksTable, useTasksTable } from '@/widgets/tasks-table'

export function TaskPage() {
  const [viewMode, setViewMode] = useState<KanbanViewMode>(
    KanbanViewMode.Kanban
  )

  const { activeOrgId } = useOrgStore()
  const route = getRouteApi('/_authenticated/task/')
  const search = route.useSearch()
  const { openCreate } = useTaskModalStore()

  const filters = useMemo(
    () => ({
      search: search.filter,
      status: search.status,
      assigneeIds: search.members,
      labelNames: search.labels,
      dueDateFrom: search.dueDate?.[0]
        ? new Date(Number(search.dueDate[0])).toISOString()
        : undefined,
      dueDateTo: search.dueDate?.[1]
        ? new Date(Number(search.dueDate[1])).toISOString()
        : undefined,
    }),
    [search]
  )

  const { data: tasks } = useTasksQuery(activeOrgId || '', filters)

  const { table, filterOptions } = useTasksTable({
    orgId: activeOrgId || '',
    data: tasks || [],
  })

  const filteredTasks = table
    .getFilteredRowModel()
    .rows.map((row) => row.original)

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
      <Main className='flex flex-col gap-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex flex-wrap gap-8'>
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
            <Button onClick={() => openCreate()}>
              <Plus className='mr-2 h-4 w-4' />
              Add Task
            </Button>
          </div>
        </div>

        <DataTableToolbar
          filterVariant={
            viewMode !== KanbanViewMode.Table ? 'compact' : 'default'
          }
          table={table}
          searchPlaceholder='Filter by title or desc...'
          filters={[
            {
              columnId: 'status',
              title: 'Status',
              options: filterOptions.statuses,
            },
            {
              columnId: 'label',
              title: 'Label',
              options: filterOptions.labels,
            },
            {
              columnId: 'assignees',
              title: 'Members',
              options: filterOptions.members,
            },
          ]}
          dateFilters={[
            {
              columnId: 'dueDate',
              title: 'Due Date',
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
      {/* <TasksDialogs /> */}
    </>
  )
}
