import { type Task } from '@/entities/task'
import { TaskBoardList } from '@/widgets/task-board'

interface PageProps {
  slug?: string
  tasks: Task[]
}

export async function TaskListPageView({ slug, tasks }: PageProps) {
  return <TaskBoardList slug={slug} tasks={tasks} />
}
