import { ProfileFormSkeleton } from '@/features/update-profile'

export default function SettingsLoading() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Profile</h3>
        <p className='text-muted-foreground text-sm'>
          This is how others will see you on the site.
        </p>
      </div>
      <ProfileFormSkeleton />
    </div>
  )
}
