import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/components/ui/tabs'
import { type TaskStatusEnum } from '@/entities/task'
import {
  ChecklistTodoProvider,
  AddTaskDialog,
  useTaskStore,
} from '@/features/task'
import { KanbanBoard } from '@/widgets/kanban-board'

type ViewMode = 'kanban' | 'list'

export function TaskPage() {
  const tasks = useTaskStore((state) => state.tasks)
  const updateTask = useTaskStore((state) => state.updateTask)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')

  const handleTaskClick = (_taskId: string) => {
    // Open task modal/drawer
    // TODO: Implement task detail modal/drawer
  }

  const handleTaskMove = (taskId: string, newStatus: TaskStatusEnum) => {
    updateTask(taskId, { status: newStatus })
  }
  return (
    <ChecklistTodoProvider>
      <div className='flex h-screen flex-col'>
        <div className='border-border border-b p-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>Tasks</h1>

            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
            >
              <TabsList>
                <TabsTrigger value='kanban' className='gap-2'>
                  <LayoutGrid className='h-4 w-4' />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value='list' className='gap-2'>
                  <List className='h-4 w-4' />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <AddTaskDialog />
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 overflow-hidden'>
          {viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onTaskMove={handleTaskMove}
              className='p-4'
            />
          ) : null}
        </div>
      </div>
    </ChecklistTodoProvider>
  )
}

// // Kanban View
// export const KanbanBoard = () => {
//   const tasks = useTaskStore((state) => state.tasks)

//   return (
//     <div className='flex gap-4'>
//       {/* Column for each status */}
//       <div className='flex-1 space-y-3'>
//         <h2 className='font-semibold'>Заплановано</h2>
//         {tasks
//           // .filter((t) => t.status === TaskStatusEnum.PLANNED)
//           .map((task) => (
//             <TaskCard
//               key={task.id}
//               task={task}
//               variant='kanban'
//               onTaskClick={(id) => console.log('Clicked:', id)}
//             />
//           ))}
//       </div>
//       {/* Other columns... */}
//     </div>
//   )
// }

// // List View
// export const TaskList = () => {
//   const tasks = useTaskStore((state) => state.tasks)

//   return (
//     <div className='space-y-2'>
//       {tasks.map((task) => (
//         <TaskCard
//           key={task.id}
//           task={task}
//           variant='list'
//           onTaskClick={(id) => console.log('Clicked:', id)}
//         />
//       ))}
//     </div>
//   )
// }
