'use client'

import { ConfigDrawer } from '@/shared/ui/config-drawer'
import { Search } from '@/shared/ui/search'
import { ThemeSwitch } from '@/shared/ui/theme-switch'
import { Header } from './header'
import { NavUser } from './nav-user'

export function AppHeader() {
  return (
    <Header>
      <Search />
      <div className='ms-auto flex items-center space-x-4'>
        <ThemeSwitch />
        <ConfigDrawer />
        <NavUser />
      </div>
    </Header>
  )
}
