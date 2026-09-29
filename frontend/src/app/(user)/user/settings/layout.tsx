import { Bell, Link2, Monitor, Palette, UserCog } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { Separator } from '@/shared/ui/core/separator'
import { SidebarNav } from '@/shared/ui/sidebar-nav'
import { requireAuthenticatedUser } from '@/entities/user/server'
import { VocabularyHeader } from '@/widgets/vocabulary-header'

export const dynamic = 'force-dynamic'

const sidebarNavItems = [
  {
    title: 'Active sessions',
    href: ROUTES.settingsSessions,
    icon: <Monitor size={18} />,
  },
  {
    title: 'Connected accounts',
    href: ROUTES.settingsAccounts,
    icon: <Link2 size={18} />,
  },
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

export default async function UserSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuthenticatedUser()

  return (
    <div className='bg-background text-foreground flex min-h-svh flex-col'>
      <VocabularyHeader user={user} />
      <main
        id='main-content'
        className='mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6'
      >
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
      </main>
    </div>
  )
}
