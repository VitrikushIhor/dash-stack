import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className='flex h-[70vh] items-center justify-center'>
      <Loader2 className='text-primary h-8 w-8 animate-spin' />
    </div>
  )
}
