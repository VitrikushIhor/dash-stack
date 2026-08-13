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
export { TaskStatusEnum, TaskViewMode } from './model/types'
export {
  CreateTaskDtoSchema,
  UpdateTaskDtoSchema,
  BulkUpdateTasksDtoSchema,
  BulkDeleteTasksDtoSchema,
} from './model/task.schema'
export * from './lib/task-utils'

export { taskApi, type TaskFilters } from './api/task-api'
export { useTaskQuery } from './model/queries'
export { STATUS_CONFIG } from './model/task-status-config'

export { ChecklistWidget } from './ui/checklist/checklist-widget'
export { FormChecklist } from './ui/checklist/form-checklist'
export { TodoItem } from './ui/checklist/todo-item'

export { TaskCard, TaskCardList, TaskCardKanban } from './ui/task-card'
export { TaskCardActions } from './ui/task-card-actions'
export { TaskStatusBadge } from './ui/task-status-badge'
