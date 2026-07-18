import { Loader2 } from 'lucide-react'
import { useCurrentUser } from '@/entities/user'
import { UpdateProfileForm } from '@/features/update-profile'
import { ContentSection } from '../ui/content-section'

export function SettingsProfile() {
  const { data: user, isLoading } = useCurrentUser()

  return (
    <ContentSection
      title='Profile'
      desc='This is how others will see you on the site.'
      className='lg:max-w-5xl'
    >
      {isLoading ? (
        <div className='flex h-40 items-center justify-center'>
          <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
        </div>
      ) : (
        <UpdateProfileForm user={user} />
      )}
    </ContentSection>
  )
}
