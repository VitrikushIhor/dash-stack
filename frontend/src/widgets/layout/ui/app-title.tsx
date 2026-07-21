'use client'

import Link from 'next/link'
import { SidebarMenu, useSidebar } from '@/shared/ui/core/sidebar'

export function AppTitle() {
  const { setOpenMobile, open } = useSidebar()
  return (
    <SidebarMenu>
      <Link href='/' onClick={() => setOpenMobile(false)}>
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
