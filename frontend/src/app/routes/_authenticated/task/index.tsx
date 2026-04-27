import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TaskStatusEnum } from '@/entities/task'
import { ChecklistTodoProvider, TasksProvider } from '@/features/task'
import { TaskPage } from '@/pages/task'

const taskSearchSchema = z.object({
  filter: z.string().optional(),
  status: z.array(z.nativeEnum(TaskStatusEnum)).optional(),
  labels: z.array(z.string()).optional(),
  members: z.array(z.string()).optional(),
  deadline: z.array(z.union([z.string(), z.number()])).optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
})

export const Route = createFileRoute('/_authenticated/task/')({
  validateSearch: (search) => taskSearchSchema.parse(search),
  component: () => (
    <ChecklistTodoProvider>
      <TasksProvider>
        <TaskPage />
      </TasksProvider>
    </ChecklistTodoProvider>
  ),
})
