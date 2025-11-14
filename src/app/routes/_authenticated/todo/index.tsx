import { createFileRoute } from '@tanstack/react-router'
import { TodoPage } from '@/pages/todo'

export const Route = createFileRoute('/_authenticated/todo/')({
  component: TodoPage,
})
