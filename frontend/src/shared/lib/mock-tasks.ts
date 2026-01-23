import { format } from 'date-fns'
import { type Task, TaskStatusEnum } from '@/entities/task'

/**
 * Helper function to format date as "dd MMM yyyy" (e.g., "08 Jan 2026")
 */
function formatDeadline(date: Date): string {
  return format(date, 'dd MMM yyyy')
}

/**
 * Mock tasks for testing calendar functionality
 * These tasks have different dates and statuses to test various calendar views
 */
export const mockTasks: Task[] = [
  // Tasks for current month
  {
    id: 'task-1',
    title: 'Team Meeting',
    description: 'Weekly sync with the development team',
    status: TaskStatusEnum.UPCOMING,
    deadline: formatDeadline(new Date()),
    assignedMembers: [],
    assignedLabels: [],
    checklists: [],
    attachments: [],
  },
  {
    id: 'task-2',
    title: 'Code Review',
    description: 'Review pull requests from team members',
    status: TaskStatusEnum.PLANNED,
    deadline: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 2)
      return formatDeadline(date)
    })(),
    assignedMembers: [],
    assignedLabels: [],
    checklists: [],
    attachments: [],
  },
  {
    id: 'task-3',
    title: 'Project Deadline',
    description: 'Final submission for Q1 project',
    status: TaskStatusEnum.UPCOMING,
    deadline: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 5)
      return formatDeadline(date)
    })(),
    assignedMembers: [],
    assignedLabels: [],
    checklists: [],
    attachments: [],
  },
  {
    id: 'task-4',
    title: 'Client Presentation',
    description: 'Present quarterly results to stakeholders',
    status: TaskStatusEnum.PLANNED,
    deadline: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      return formatDeadline(date)
    })(),
    assignedMembers: [],
    assignedLabels: [],
    checklists: [],
    attachments: [],
  },
  {
    id: 'task-5',
    title: 'Sprint Planning',
    description: 'Plan tasks for the next sprint',
    status: TaskStatusEnum.UPCOMING,
    deadline: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 10)
      return formatDeadline(date)
    })(),
    assignedMembers: [],
    assignedLabels: [],
    checklists: [],
    attachments: [],
  },
  // Tasks for next month
  {
    id: 'task-6',
    title: 'Product Launch',
    description: 'Launch new product features',
    status: TaskStatusEnum.PLANNED,
    deadline: (() => {
      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      date.setDate(1)
      return formatDeadline(date)
    })(),
    assignedMembers: [],
    assignedLabels: [],
    checklists: [],
    attachments: [],
  },
  {
    id: 'task-7',
    title: 'Team Building Event',
    description: 'Quarterly team building activity',
    status: TaskStatusEnum.UPCOMING,
    deadline: (() => {
      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      date.setDate(15)
      return formatDeadline(date)
    })(),
    assignedMembers: [],
    assignedLabels: [],
    checklists: [],
    attachments: [],
  },
  // Tasks for previous month
  {
    id: 'task-8',
    title: 'Completed Task Example',
    description: 'This is a completed task',
    status: TaskStatusEnum.COMPLETED,
    deadline: (() => {
      const date = new Date()
      date.setMonth(date.getMonth() - 1)
      date.setDate(20)
      return formatDeadline(date)
    })(),
    assignedMembers: [],
    assignedLabels: [],
    checklists: [],
    attachments: [],
  },
  // Tasks with specific dates in 2026 (like the user's example)
  {
    id: 'task-9',
    title: 'цукцкуцук',
    description: 'цукуцкцкцу',
    status: TaskStatusEnum.UPCOMING,
    deadline: '08 Jan 2026',
    assignedMembers: [],
    assignedLabels: [],
    checklists: [],
    attachments: [],
  },
  {
    id: 'task-10',
    title: 'New Year Planning',
    description: 'Plan goals and objectives for 2026',
    status: TaskStatusEnum.PLANNED,
    deadline: '15 Jan 2026',
    assignedMembers: [],
    assignedLabels: [],
    checklists: [],
    attachments: [],
  },
  {
    id: 'task-11',
    title: 'Q1 Review Meeting',
    description: 'Review Q1 performance and metrics',
    status: TaskStatusEnum.UPCOMING,
    deadline: '22 Jan 2026',
    assignedMembers: [],
    assignedLabels: [],
    checklists: [],
    attachments: [],
  },
  {
    id: 'task-12',
    title: 'Budget Planning',
    description: 'Plan annual budget for 2026',
    status: TaskStatusEnum.PLANNED,
    deadline: '05 Feb 2026',
    assignedMembers: [],
    assignedLabels: [],
    checklists: [],
    attachments: [],
  },
]

/**
 * Function to add mock tasks to the store
 * Usage: Call this function in your component or console to add test tasks
 */
export function addMockTasksToStore() {
  if (typeof window === 'undefined') return

  // Dynamic import to avoid SSR issues
  import('@/features/task').then(({ useTaskStore }) => {
    const store = useTaskStore.getState()

    // Clear existing tasks first (optional)
    // store.clearTasks()

    // Add all mock tasks
    mockTasks.forEach((task) => {
      store.addTask(task)
    })

    // eslint-disable-next-line no-console
    console.log(`✅ Added ${mockTasks.length} mock tasks to the store`)
    // eslint-disable-next-line no-console
    console.log(
      'Tasks:',
      mockTasks.map((t) => ({ title: t.title, deadline: t.deadline }))
    )
  })
}

/**
 * Function to initialize store with mock tasks (only if store is empty)
 */
export function initializeStoreWithMockTasks() {
  if (typeof window === 'undefined') return

  import('@/features/task').then(({ useTaskStore }) => {
    const store = useTaskStore.getState()

    // Only add if store is empty
    if (store.tasks.length === 0) {
      mockTasks.forEach((task) => {
        store.addTask(task)
      })
      // eslint-disable-next-line no-console
      console.log(`✅ Initialized store with ${mockTasks.length} mock tasks`)
    } else {
      // eslint-disable-next-line no-console
      console.log(
        `ℹ️ Store already has ${store.tasks.length} tasks. Skipping initialization.`
      )
    }
  })
}
