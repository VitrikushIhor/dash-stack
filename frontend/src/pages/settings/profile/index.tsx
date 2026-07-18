import { Skeleton } from '@/shared/ui/core/skeleton'
import { useCurrentUser } from '@/entities/user'
import { UpdateProfileForm } from '@/features/update-profile'
import { ContentSection } from '../ui/content-section'

export function SettingsProfile() {
  const { data: user, isLoading } = useCurrentUser()

  if (!isLoading && !user) {
    return (
      <ContentSection
        title='Profile'
        desc='Unable to load your profile.'
        className='lg:max-w-5xl'
      >
        <p className='text-muted-foreground'>User not found.</p>
      </ContentSection>
    )
  }

  return (
    <ContentSection
      title='Profile'
      desc='This is how others will see you on the site.'
      className='lg:max-w-5xl'
    >
      {isLoading ? (
        <div className='flex h-40 items-center justify-center'>
          <Skeleton className='h-8 w-8 rounded-full' />
        </div>
      ) : (
        <UpdateProfileForm user={user!} />
      )}
    </ContentSection>
  )
}
