import { UpdateProfileForm } from '@/features/update-profile'
import { ContentSection } from '../ui/content-section'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Profile'
      desc='This is how others will see you on the site.'
      className='lg:max-w-5xl'
    >
      <UpdateProfileForm />
    </ContentSection>
  )
}
