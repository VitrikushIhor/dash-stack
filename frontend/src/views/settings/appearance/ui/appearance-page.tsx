import { SettingsSection } from '../../ui/settings-section'
import { AppearanceForm } from './appearance-form'

export function AppearancePage() {
  return (
    <SettingsSection
      title='Appearance'
      description='Customize the appearance of the app. Automatically switch between day and night themes.'
    >
      <AppearanceForm />
    </SettingsSection>
  )
}
