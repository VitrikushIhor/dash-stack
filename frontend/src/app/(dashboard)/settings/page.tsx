import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/entities/user/server'
import { UpdateProfileForm } from '@/features/update-profile'

export default async function SettingsProfilePage() {
  const { data: user } = await getCurrentUser()

  if (!user) {
    notFound()
  }

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Profile</h3>
        <p className='text-muted-foreground text-sm'>
          This is how others will see you on the site.
        </p>
      </div>
      <UpdateProfileForm user={user} />
    </div>
  )
}
