'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, List, Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import {
  ConfigDrawer,
  DataTableToolbar,
  Search,
  ThemeSwitch,
} from '@/shared/ui'
import { Button } from '@/shared/ui/core/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/core/tabs'
import { useOrgStore } from '@/entities/organization'
import { useTasksQuery, type TaskStatusEnum } from '@/entities/task'
import { useTaskModalStore } from '@/features/manage-task'
import { KanbanTaskBoard, KanbanViewMode } from '@/widgets/kanban-board'
import { Header, Main, NavUser } from '@/widgets/layout'
import { TasksTable, useTasksTable } from '@/widgets/tasks-table'

export function TaskPage() {
  const [viewMode, setViewMode] = useState<KanbanViewMode>(
    KanbanViewMode.Kanban
  )

  const { activeOrgId } = useOrgStore()
  const searchParams = useSearchParams()
  const { openCreate } = useTaskModalStore()

  const searchString = searchParams.toString()

  const filters = useMemo(() => {
    const filter = searchParams.get('filter') ?? undefined
    const status = searchParams.getAll('status')
    const members = searchParams.getAll('members')
    const labels = searchParams.getAll('labels')
    const dueDate = searchParams.getAll('dueDate')

    const parseDate = (val: string | undefined): string | undefined => {
      if (!val) return undefined
      const num = Number(val)
      const date = !isNaN(num) ? new Date(num) : new Date(val)
      return isNaN(date.getTime()) ? undefined : date.toISOString()
    }

    return {
      search: filter,
      status: status.length > 0 ? (status as TaskStatusEnum[]) : undefined,
      assigneeIds: members.length > 0 ? members : undefined,
      labelNames: labels.length > 0 ? labels : undefined,
      dueDateFrom: parseDate(dueDate[0]),
      dueDateTo: parseDate(dueDate[1]),
    }
  }, [searchParams, searchString])

  const { data: tasks } = useTasksQuery(activeOrgId || '', filters)

  const { table } = useTasksTable({
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

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your tasks for this organization!
            </p>
          </div>

          <div className='flex items-center space-x-2'>
            <Tabs
              value={viewMode}
              onValueChange={(val) => setViewMode(val as KanbanViewMode)}
            >
              <TabsList>
                <TabsTrigger value={KanbanViewMode.Kanban}>
                  <LayoutGrid className='h-4 w-4' />
                </TabsTrigger>
                <TabsTrigger value={KanbanViewMode.Table}>
                  <List className='h-4 w-4' />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={() => openCreate()} size='sm'>
              <Plus className='mr-2 h-4 w-4' /> Add task
            </Button>
          </div>
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <div className='mb-4'>
            <DataTableToolbar table={table} />
          </div>

          {viewMode === KanbanViewMode.Kanban ? (
            <KanbanTaskBoard viewMode={viewMode} tasks={filteredTasks} />
          ) : (
            <TasksTable table={table} />
          )}
        </div>
      </Main>
    </>
  )
}
