import { Link } from '@tanstack/react-router'
import { SidebarMenu, useSidebar } from '@/shared/ui/core/sidebar'

export function AppTitle() {
  const { setOpenMobile, open } = useSidebar()
  return (
    <SidebarMenu>
      <Link to='/' onClick={() => setOpenMobile(false)}>
        {open && (
          <div className='text-lg'>
            <span className='text-primary font-bold'>Dash</span>
            <span className='text-foreground font-bold'>Stack</span>
          </div>
        )}
        {!open && (
          <div className='text-center text-lg'>
            <span className='text-primary font-bold'>D</span>
            <span className='text-foreground font-bold'>S</span>
          </div>
        )}
      </Link>
    </SidebarMenu>
  )
}
