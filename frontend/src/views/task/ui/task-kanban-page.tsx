import { type Task } from '@/entities/task'
import { TaskBoardKanban } from '@/widgets/task-board'

interface PageProps {
  slug?: string
  tasks: Task[]
}

export async function TaskKanbanPageView({ slug, tasks }: PageProps) {
  return <TaskBoardKanban slug={slug} tasks={tasks} />
}
