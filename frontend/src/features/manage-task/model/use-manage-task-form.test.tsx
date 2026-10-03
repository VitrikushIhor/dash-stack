import { type ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { type Task, TaskStatusEnum } from '@/entities/task'
import { createTaskAction, updateTaskAction } from '../server'
import { type TaskFormValues } from './task-form.schema'
import { ManageTaskMode } from './types'
import { useManageTaskForm } from './use-manage-task-form'

vi.mock('../server', () => ({
  createTaskAction: vi.fn(),
  updateTaskAction: vi.fn(),
}))

const task: Task = {
  id: 'task-1',
  title: 'Task one',
  status: TaskStatusEnum.PLANNED,
  attachments: [],
  organizationId: 'org-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  assignees: [],
  label: null,
}

const values: TaskFormValues = {
  title: 'Task one',
  status: TaskStatusEnum.PLANNED,
  assignees: [],
  label: null,
  files: [],
  checklists: [],
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <NuqsTestingAdapter hasMemory>{children}</NuqsTestingAdapter>
)

describe('useManageTaskForm', () => {
  it('should_create_task_and_close_when_create_succeeds', async () => {
    vi.mocked(createTaskAction).mockResolvedValue({ success: true, data: task })
    const close = vi.fn()
    const { result } = renderHook(
      () =>
        useManageTaskForm({
          slug: 'org-1',
          mode: ManageTaskMode.CREATE,
          selectedTask: null,
          close,
        }),
      { wrapper }
    )

    await act(async () => result.current.onSubmit(values))

    expect(createTaskAction).toHaveBeenCalledWith({
      slug: 'org-1',
      data: expect.objectContaining({ title: 'Task one' }),
    })
    expect(close).toHaveBeenCalledOnce()
  })

  it('should_update_selected_task_and_close_when_update_succeeds', async () => {
    vi.mocked(updateTaskAction).mockResolvedValue({ success: true, data: task })
    const close = vi.fn()
    const { result } = renderHook(
      () =>
        useManageTaskForm({
          slug: 'org-1',
          mode: ManageTaskMode.EDIT,
          selectedTask: task,
          close,
        }),
      { wrapper }
    )

    await act(async () => result.current.onSubmit(values))

    expect(updateTaskAction).toHaveBeenCalledWith({
      slug: 'org-1',
      id: 'task-1',
      data: expect.objectContaining({ title: 'Task one' }),
    })
    expect(close).toHaveBeenCalledOnce()
  })
})
