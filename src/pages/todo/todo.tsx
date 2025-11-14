import { ChecklistTodoProvider, AddTodoDialog } from '@/features/todo'

export function TodoPage() {
  return (
    <div className='container mx-auto p-8'>
      <ChecklistTodoProvider>
        <AddTodoDialog />

        <div className='max-w-2xl space-y-6'>
          {/* Компонент як на картинці */}
        </div>
      </ChecklistTodoProvider>
    </div>
  )
}
