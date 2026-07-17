import { createFileRoute } from '@tanstack/react-router'
import { SettingsProfile } from '@/pages/settings'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsProfile,
})
