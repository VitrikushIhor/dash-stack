import { createFileRoute } from '@tanstack/react-router'
import { SettingsNotifications } from '@/pages/settings'

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: SettingsNotifications,
})
