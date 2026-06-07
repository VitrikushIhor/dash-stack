import { type UseMutationResult } from '@tanstack/react-query'
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  TaskStatusEnum,
  type Task,
  type CreateTaskDto,
  type UpdateTaskDto,
} from '@/entities/task'
import * as mutations from '../mutations'
import { useTaskForm } from './use-task-form'

// Mock everything
vi.mock('../mutations', () => ({
  useCreateTask: vi.fn(),
  useUpdateTask: vi.fn(),
}))

vi.mock('../store/checklist-todo-context', () => ({
  useTodoChecklists: vi.fn(() => []),
  useChecklistTodoActions: vi.fn(() => ({ setChecklists: vi.fn() })),
}))

describe('useTaskForm', () => {
  const orgId = 'org-1'

  const mockMutateAsync = vi.fn()

  vi.mocked(mutations.useCreateTask).mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  } as unknown as UseMutationResult<Task, Error, CreateTaskDto>)

  vi.mocked(mutations.useUpdateTask).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as UseMutationResult<
    Task,
    Error,
    { id: string; data: UpdateTaskDto }
  >)

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTaskForm(orgId))

    expect(result.current.form.getValues()).toEqual({
      title: '',
      description: '',
      status: TaskStatusEnum.PLANNED,
      deadline: undefined,
    })
    expect(result.current.selectedMembers).toEqual([])
    expect(result.current.selectedLabel).toBeNull()
    expect(result.current.files).toEqual([])
  })

  it('should call createTaskMutation on submit', async () => {
    const { result } = renderHook(() => useTaskForm(orgId))

    await act(async () => {
      result.current.form.setValue('title', 'New Task')
      await result.current.handleSubmit(result.current.form.getValues())
    })

    expect(mockMutateAsync).toHaveBeenCalled()
  })
})
