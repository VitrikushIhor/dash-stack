import {
  Settings,
  ShieldCheck,
  UsersRound,
  ClipboardList,
  Calendar,
} from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'General',
      items: [
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
          url: ROUTES.settings,
          icon: Settings,
        },
      ],
    },
  ],
}
