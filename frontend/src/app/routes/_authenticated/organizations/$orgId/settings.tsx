import { createFileRoute, useParams } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import { Separator } from '@/shared/ui/core/separator'
import {
  useGetOrganization,
  OrganizationSettingsForm,
  DeleteOrganizationButton,
  useOrganizationPermission,
} from '@/features/organization'

export const Route = createFileRoute(
  '/_authenticated/organizations/$orgId/settings'
)({
  component: OrganizationSettingsPage,
})

function OrganizationSettingsPage() {
  const { orgId } = useParams({
    from: '/_authenticated/organizations/$orgId/settings',
  })
  const { data: organization, isLoading: isOrgLoading } = useGetOrganization(
    orgId,
    { staleTime: Infinity }
  )
  const {
    canManage,
    isOwner,
    isLoading: isPermissionLoading,
  } = useOrganizationPermission(organization)

  if (isOrgLoading || isPermissionLoading) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
      </div>
    )
  }

  if (!organization) return null

  if (!canManage) {
    return (
      <div className='py-20 text-center'>
        <h2 className='text-destructive text-xl font-bold'>Access Denied</h2>
        <p className='text-muted-foreground'>
          You don't have permission to view this page.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Settings</h2>
        <p className='text-muted-foreground'>
          Manage your organization settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Update your organization name, description and logo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationSettingsForm organization={organization} />
        </CardContent>
      </Card>

      {isOwner && (
        <Card className='border-destructive/50'>
          <CardHeader>
            <CardTitle className='text-destructive'>Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this organization and all its data.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Separator />
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <div className='font-medium'>Delete Organization</div>
                <div className='text-muted-foreground text-sm'>
                  Once you delete an organization, there is no going back.
                  Please be certain.
                </div>
              </div>
              <DeleteOrganizationButton orgId={orgId} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
