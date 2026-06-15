// Public API for Task entity
export type {
  Task,
  Checklist,
  ChecklistItem,
  TaskLabel,
  TaskAssignee,
  CreateTaskDto,
  UpdateTaskDto,
} from './model/types'
export { TaskStatusEnum } from './model/types'
export * from './lib/task-utils'

export { taskApi, type TaskFilters } from './api/task-api'
export { useTasksQuery, useTaskQuery } from './model/queries'
export {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useBulkUpdateTasks,
  useBulkDeleteTasks,
} from './model/mutations'
export { STATUS_CONFIG } from './model/task-status-config'

export { ChecklistWidget } from './ui/checklist/checklist-widget'
export { FormChecklist } from './ui/checklist/form-checklist'
export { TodoItem } from './ui/checklist/todo-item'
