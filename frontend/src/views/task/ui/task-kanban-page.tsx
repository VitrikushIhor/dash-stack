import { type Task } from '@/entities/task'
import { TaskBoardKanban } from '@/widgets/task-board'

interface PageProps {
  tasks: Task[]
}

export async function TaskKanbanPageView({ tasks }: PageProps) {
  return <TaskBoardKanban tasks={tasks} />
}
