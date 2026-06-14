import { describe, it, expect, beforeEach } from 'vitest'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { useTaskModalStore, TaskModalMode } from './use-task-modal-store'

const mockTask: Task = {
  id: 'task-123',
  title: 'Test Task',
  status: TaskStatusEnum.PLANNED,
  dueDate: '2026-06-10T12:00:00Z',
  attachments: [],
  organizationId: 'org-1',
  createdAt: '',
  updatedAt: '',
  assignees: [],
  label: { id: 'l1', name: 'Low', color: 'blue' as const },
}

describe('useTaskModalStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTaskModalStore.setState({
      isOpen: false,
      mode: TaskModalMode.CREATE,
      selectedTask: null,
    })
  })

  it('should have initial state', () => {
    const state = useTaskModalStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.mode).toBe(TaskModalMode.CREATE)
    expect(state.selectedTask).toBeNull()
  })

  it('should open in CREATE mode and handle optional initial data', () => {
    // Without initial data
    useTaskModalStore.getState().openCreate()
    let state = useTaskModalStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.mode).toBe(TaskModalMode.CREATE)
    expect(state.selectedTask).toBeNull()

    // With initial data (e.g., status)
    const initialData = { status: TaskStatusEnum.UPCOMING }
    useTaskModalStore.getState().openCreate(initialData)
    state = useTaskModalStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.mode).toBe(TaskModalMode.CREATE)
    expect(state.selectedTask).toEqual(initialData)
  })

  it('should open in EDIT mode and cache the selected task', () => {
    useTaskModalStore.getState().openEdit(mockTask)
    const state = useTaskModalStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.mode).toBe(TaskModalMode.EDIT)
    expect(state.selectedTask).toEqual(mockTask)
  })

  it('should open in DELETE mode and cache the selected task', () => {
    useTaskModalStore.getState().openDelete(mockTask)
    const state = useTaskModalStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.mode).toBe(TaskModalMode.DELETE)
    expect(state.selectedTask).toEqual(mockTask)
  })

  it('should reset state to closed when close is called', () => {
    // First, open it
    useTaskModalStore.getState().openEdit(mockTask)
    expect(useTaskModalStore.getState().isOpen).toBe(true)

    // Then, close it
    useTaskModalStore.getState().close()
    const state = useTaskModalStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.selectedTask).toBeNull()
  })
})
