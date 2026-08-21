import { Building2, LineChart, Users } from 'lucide-react'

export function CreateOrganizationInfo() {
  return (
    <div className='order-2 md:order-1'>
      <h2 className='text-3xl font-extrabold tracking-tight sm:text-4xl'>
        Build something amazing
      </h2>
      <p className='text-muted-foreground mt-4 text-lg'>
        Create your organization in seconds. Add your team, set up your
        projects, and start building your next big thing with our powerful
        tools.
      </p>

      <div className='mt-10 space-y-8'>
        <div className='flex items-start gap-4'>
          <div className='bg-primary/10 text-primary rounded-xl p-3'>
            <Building2 className='h-6 w-6' />
          </div>
          <div>
            <h3 className='text-lg font-semibold'>Centralized Workspace</h3>
            <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
              Keep all your projects, settings, and billing in one secure,
              manageable place.
            </p>
          </div>
        </div>

        <div className='flex items-start gap-4'>
          <div className='rounded-xl bg-emerald-500/10 p-3 text-emerald-500'>
            <Users className='h-6 w-6' />
          </div>
          <div>
            <h3 className='text-lg font-semibold'>Team Collaboration</h3>
            <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
              Invite team members with role-based access control and secure
              sharing.
            </p>
          </div>
        </div>

        <div className='flex items-start gap-4'>
          <div className='rounded-xl bg-purple-500/10 p-3 text-purple-500'>
            <LineChart className='h-6 w-6' />
          </div>
          <div>
            <h3 className='text-lg font-semibold'>Performance Tracking</h3>
            <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
              Monitor KPIs and track your growth with precision and accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
