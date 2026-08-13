import { type Task } from '@/entities/task'
import { TaskBoardList } from '@/widgets/task-board'

interface PageProps {
  tasks: Task[]
}

export async function TaskListPageView({ tasks }: PageProps) {
  return <TaskBoardList tasks={tasks} />
}
