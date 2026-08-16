import { SettingsSection } from '../../ui/settings-section'
import { NotificationsForm } from './notifications-form'

export function NotificationsPage() {
  return (
    <SettingsSection
      title='Notifications'
      description='Configure how you receive notifications.'
    >
      <NotificationsForm />
    </SettingsSection>
  )
}
