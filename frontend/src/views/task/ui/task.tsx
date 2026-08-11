'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, List, Table as TableIcon, Plus } from 'lucide-react'
import { useTasksTableSearchParams } from '@/shared/lib'
import { Button } from '@/shared/ui/core/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/core/tabs'
import { DataTableToolbar } from '@/shared/ui/data-table'
import { useGetLabels } from '@/entities/label'
import { useActiveOrganization, useGetMembers } from '@/entities/organization'
import { useTasksQuery, type TaskStatusEnum } from '@/entities/task'
import { useTaskModalStore } from '@/features/manage-task'
import { KanbanTaskBoard, KanbanViewMode } from '@/widgets/kanban-board'
import { Main } from '@/widgets/layout'
import {
  TasksTable,
  useTasksTableState,
  tasksColumns,
  generateFilterOptions,
} from '@/widgets/tasks-table'
import { parseDateSafe } from '@/widgets/tasks-table/lib/filters'

export function TaskPage() {
  const [viewMode, setViewMode] = useState<KanbanViewMode>(
    KanbanViewMode.Kanban
  )

  const { activeOrg } = useActiveOrganization()
  const activeOrgId = activeOrg?.id
  const [tableSearchParams] = useTasksTableSearchParams()
  const { openCreate } = useTaskModalStore()

  const filters = useMemo(() => {
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
      dueDateFrom: parseDateSafe(tableSearchParams.dueDate[0]),
      dueDateTo: parseDateSafe(tableSearchParams.dueDate[1]),
      page: viewMode === KanbanViewMode.Table ? tableSearchParams.page : 1,
      perPage:
        viewMode === KanbanViewMode.Table ? tableSearchParams.perPage : 100,
    }
  }, [tableSearchParams, viewMode])

  const { data: paginatedTasks } = useTasksQuery(activeOrgId || '', filters)
  const tasks = paginatedTasks?.data || []

  // Parallel data fetching for table metadata (waterfall removed)
  const { data: members = [] } = useGetMembers(activeOrgId || '')
  const { data: availableLabels = [] } = useGetLabels(activeOrgId || '')

  const table = useTasksTableState({
    data: tasks,
    columns: tasksColumns,
    pageCount: paginatedTasks?.meta?.lastPage ?? -1,
  })

  const filterOptions = useMemo(
    () => generateFilterOptions(members, availableLabels),
    [members, availableLabels]
  )

  const filteredTasks = table
    .getFilteredRowModel()
    .rows.map((row) => row.original)

  return (
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
                options: filterOptions.status,
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
        </div>

        {viewMode === KanbanViewMode.Table ? (
          <TasksTable table={table} />
        ) : (
          <KanbanTaskBoard viewMode={viewMode} tasks={filteredTasks} />
        )}
      </div>
    </Main>
  )
}
