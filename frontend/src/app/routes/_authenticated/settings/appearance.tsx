import { createFileRoute } from '@tanstack/react-router'
import { SettingsAppearance } from '@/pages/settings'

export const Route = createFileRoute('/_authenticated/settings/appearance')({
  component: SettingsAppearance,
})
