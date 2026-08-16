import { Monitor, Bell, Palette, UserCog } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { Separator } from '@/shared/ui/core/separator'
import { SidebarNav } from '@/shared/ui/sidebar-nav'
import { Main } from '@/widgets/layout'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: ROUTES.settings,
    icon: <UserCog size={18} />,
  },
  {
    title: 'Appearance',
    href: ROUTES.settingsAppearance,
    icon: <Palette size={18} />,
  },
  {
    title: 'Notifications',
    href: ROUTES.settingsNotifications,
    icon: <Bell size={18} />,
  },
  {
    title: 'Display',
    href: ROUTES.settingsDisplay,
    icon: <Monitor size={18} />,
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Main fixed>
      <div className='space-y-0.5'>
        <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
          Settings
        </h1>
        <p className='text-muted-foreground'>
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className='my-4 lg:my-6' />
      <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
        <aside className='top-0 lg:sticky lg:w-1/5'>
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className='faded-bottom flex w-full flex-1 overflow-y-auto scroll-smooth p-1 pe-4 pb-12'>
          <div className='w-full lg:max-w-5xl'>{children}</div>
        </div>
      </div>
    </Main>
  )
}
