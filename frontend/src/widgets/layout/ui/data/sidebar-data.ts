import {
  Calendar,
  ClipboardList,
  Compass,
  Library,
  Settings,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { type SidebarData } from '../types'

export const getSidebarData = (slug?: string): SidebarData => ({
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Organizations',
          url: ROUTES.organizations,
          icon: UsersRound,
        },
        ...(slug
          ? [
              {
                title: 'Tasks',
                url: ROUTES.orgTasks(slug),
                icon: ClipboardList,
              },
              {
                title: 'Calendar',
                url: ROUTES.orgCalendar(slug),
                icon: Calendar,
              },
            ]
          : []),
      ],
    },

    {
      title: 'Vocabulary',
      items: [
        {
          title: 'My Decks',
          url: ROUTES.vocabDecks,
          icon: Library,
        },
        {
          title: 'Catalog',
          url: ROUTES.vocabCatalog,
          icon: Compass,
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
})

export const sidebarData: SidebarData = getSidebarData()
