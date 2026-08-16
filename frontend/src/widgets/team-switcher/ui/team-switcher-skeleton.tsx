import { SidebarMenu, SidebarMenuItem } from '@/shared/ui/core/sidebar'
import { Skeleton } from '@/shared/ui/core/skeleton'

export function TeamSwitcherSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className='flex items-center gap-2 p-2'>
          <Skeleton className='size-8 rounded-lg' />
          <div className='flex flex-col gap-1'>
            <Skeleton className='h-3 w-24' />
            <Skeleton className='h-2 w-16' />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
