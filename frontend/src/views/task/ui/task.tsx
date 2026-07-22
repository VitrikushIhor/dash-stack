'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, List, Table as TableIcon, Plus } from 'lucide-react'
import { useTasksTableSearchParams } from '@/shared/lib'
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
  const [tableSearchParams] = useTasksTableSearchParams()
  const { openCreate } = useTaskModalStore()

  const filters = useMemo(() => {
    const parseDate = (val: string | undefined): string | undefined => {
      if (!val) return undefined
      const num = Number(val)
      const date = !isNaN(num) ? new Date(num) : new Date(val)
      return isNaN(date.getTime()) ? undefined : date.toISOString()
    }

    return {
      search: tableSearchParams.filter || undefined,
      status:
        tableSearchParams.status.length > 0
          ? (tableSearchParams.status as TaskStatusEnum[])
          : undefined,
      assigneeIds:
        tableSearchParams.members.length > 0
          ? tableSearchParams.members
          : undefined,
      labelNames:
        tableSearchParams.labels.length > 0
          ? tableSearchParams.labels
          : undefined,
      dueDateFrom: parseDate(tableSearchParams.dueDate[0]),
      dueDateTo: parseDate(tableSearchParams.dueDate[1]),
    }
  }, [tableSearchParams])

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
                <TabsTrigger value={KanbanViewMode.List}>
                  <List className='h-4 w-4' />
                </TabsTrigger>
                <TabsTrigger value={KanbanViewMode.Table}>
                  <TableIcon className='h-4 w-4' />
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

          {viewMode === KanbanViewMode.Table ? (
            <TasksTable table={table} />
          ) : (
            <KanbanTaskBoard viewMode={viewMode} tasks={filteredTasks} />
          )}
        </div>
      </Main>
    </>
  )
}
