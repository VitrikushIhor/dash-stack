import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/core/card'
import type { Organization } from '@/entities/organization'
import { DeleteOrganizationButton } from '@/features/delete-organization'
import { OrganizationSettingsForm } from '@/features/update-organization'

interface SettingsTabContentProps {
  organization: Organization
}

export function SettingsTabContent({ organization }: SettingsTabContentProps) {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationSettingsForm organization={organization} />
        </CardContent>
      </Card>

      <Card className='border-destructive/30'>
        <CardHeader>
          <CardTitle className='text-destructive'>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='font-medium'>Delete Organization</p>
            <p className='text-muted-foreground text-sm'>
              Permanently remove this organization and all its associated data.
            </p>
          </div>
          <DeleteOrganizationButton slug={organization.slug} />
        </CardContent>
      </Card>
    </div>
  )
}
