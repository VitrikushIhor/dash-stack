import { createFileRoute } from '@tanstack/react-router'
import { SettingsDisplay } from '@/pages/settings'

export const Route = createFileRoute('/_authenticated/settings/display')({
  component: SettingsDisplay,
})
