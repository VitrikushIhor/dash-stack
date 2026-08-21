import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import { CreateOrganizationForm } from '@/features/create-organization'
import { CreateOrganizationInfo } from './create-organization-info'

export function CreateOrganization() {
  return (
    <main className='container mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
      <div className='grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-8'>
        <CreateOrganizationInfo />
        <div className='order-1 md:order-2'>
          <Card className='border-primary/10 shadow-lg'>
            <CardHeader className='pb-6'>
              <CardTitle className='text-2xl font-bold tracking-tight'>
                Create your workspace
              </CardTitle>
              <CardDescription className='text-base'>
                Set up your organization to start collaborating with your team
                and tracking your metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateOrganizationForm submitLabel='Get Started &rarr;' />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
