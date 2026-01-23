import { createFileRoute } from '@tanstack/react-router'
import { SettingsAccount } from '@/pages/settings'

export const Route = createFileRoute('/_authenticated/settings/account')({
  component: SettingsAccount,
})
