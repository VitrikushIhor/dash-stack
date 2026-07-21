'use client'

import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import { BarChartIcon, ActivityIcon, ChartLineIcon } from '@/shared/ui/icons'
import { CreateOrganizationForm } from '@/features/organization'
import { LandingFooter } from '@/widgets/landing-footer'
import { LandingNavbar } from '@/widgets/landing-navbar'

export function CreateOrganizationPage() {
  const router = useRouter()

  return (
    <div className='flex min-h-screen flex-col'>
      <LandingNavbar />

      <main className='bg-muted/20 flex flex-1 flex-col items-center justify-center p-4 pt-24 md:p-8 md:pt-32'>
        <div className='mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12'>
          {/* Left Side: Marketing Elements */}
          <div className='order-2 flex flex-col gap-8 p-6 md:order-1'>
            <div>
              <h2 className='text-foreground mb-4 text-3xl font-extrabold tracking-tight'>
                Unlock your business potential
              </h2>
              <p className='text-muted-foreground text-lg leading-relaxed'>
                Dash Stack provides everything you need to scale your
                operations, analyze data in real-time, and outpace the
                competition.
              </p>
            </div>

            <div className='grid gap-6'>
              <div className='flex items-start gap-4'>
                <div className='rounded-xl bg-emerald-500/10 p-3 text-emerald-500'>
                  <BarChartIcon />
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>Actionable Insights</h3>
                  <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                    Turn raw data into clear strategies with our advanced
                    visualization tools.
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='rounded-xl bg-blue-500/10 p-3 text-blue-500'>
                  <ActivityIcon />
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>
                    Real-time Collaboration
                  </h3>
                  <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                    Invite your team members and work together seamlessly in one
                    unified workspace.
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='rounded-xl bg-purple-500/10 p-3 text-purple-500'>
                  <ChartLineIcon />
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>
                    Performance Tracking
                  </h3>
                  <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                    Monitor KPIs and track your growth with precision and
                    accuracy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
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
                <CreateOrganizationForm
                  submitLabel='Get Started &rarr;'
                  onSuccess={() => router.push('/organizations')}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
