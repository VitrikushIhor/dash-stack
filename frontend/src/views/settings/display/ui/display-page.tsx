import { SettingsSection } from '../../ui/settings-section'
import { DisplayForm } from './display-form'

export function DisplayPage() {
  return (
    <SettingsSection
      title='Display'
      description="Turn items on or off to control what's displayed in the app."
    >
      <DisplayForm />
    </SettingsSection>
  )
}
