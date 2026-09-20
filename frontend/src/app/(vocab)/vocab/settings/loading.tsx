import { Separator } from '@/shared/ui/core/separator'
import { ProfileFormSkeleton } from '@/features/update-profile'

export default function VocabularySettingsLoading() {
  return (
    <div className='mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6'>
      <div className='space-y-0.5'>
        <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
          Settings
        </h1>
        <p className='text-muted-foreground'>Manage your account settings.</p>
      </div>
      <Separator />
      <section className='space-y-6'>
        <div>
          <h2 className='text-lg font-medium'>Profile</h2>
          <p className='text-muted-foreground text-sm'>
            This is how others will see you on the site.
          </p>
        </div>
        <ProfileFormSkeleton />
      </section>
    </div>
  )
}
