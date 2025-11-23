import { createFileRoute } from '@tanstack/react-router'
import { ChecklistTodoProvider, TasksProvider } from '@/features/task'
import { TaskPage } from '@/pages/task'

export const Route = createFileRoute('/_authenticated/task/')({
  component: () => (
    <ChecklistTodoProvider>
      <TasksProvider>
        <TaskPage />
      </TasksProvider>
    </ChecklistTodoProvider>
  ),
})
