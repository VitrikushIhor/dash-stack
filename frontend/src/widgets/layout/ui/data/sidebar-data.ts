import {
  LayoutDashboard,
  Monitor,
  Bell,
  Palette,
  Settings,
  Wrench,
  UserCog,
  ShieldCheck,
  UsersRound,
  ClipboardList,
  Calendar,
} from 'lucide-react'
import { ROUTES } from '@/shared/config/constants/routes'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: ROUTES.dashboard,
          icon: LayoutDashboard,
        },
        {
          title: 'Organizations',
          url: ROUTES.organizations,
          icon: UsersRound,
        },
        {
          title: 'Tasks',
          url: ROUTES.task,
          icon: ClipboardList,
        },
        {
          title: 'Calendar',
          url: ROUTES.calendar,
          icon: Calendar,
        },
      ],
    },

    {
      title: 'Pages',
      items: [
        {
          title: 'Auth',
          icon: ShieldCheck,
          items: [
            {
              title: 'Sign In',
              url: ROUTES.signIn,
            },
            {
              title: 'Sign Up',
              url: ROUTES.signUp,
            },
            {
              title: 'Forgot Password',
              url: ROUTES.forgotPassword,
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: ROUTES.settings,
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
      ],
    },
  ],
}
