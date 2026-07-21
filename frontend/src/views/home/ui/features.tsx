import { Card } from '@/shared/ui/core/card'
import {
  ChartLineIcon,
  BarChartIcon,
  ActivityIcon,
  AnalyticsIcon,
} from '@/shared/ui/icons'
import { Reveal } from '@/shared/ui/reveal'

const MINI_KPIS = [
  { label: 'Revenue', value: '$45.2K', trend: '↑ 20.1%' },
  { label: 'Subscriptions', value: '2,350', trend: '↑ 180%' },
  { label: 'Sales', value: '12,234', trend: '↑ 19%' },
  { label: 'Active', value: '573', trend: '↑ live' },
]

export function Features() {
  return (
    <section id='features' className='mx-auto max-w-7xl px-6 py-24'>
      <Reveal>
        <div className='mb-14'>
          <p className='font-inter mb-3 text-xs font-semibold tracking-widest text-emerald-500 uppercase'>
            Features
          </p>
          <h2 className='font-inter text-foreground m-0 text-[clamp(28px,3.5vw,44px)] font-extrabold tracking-tight'>
            Everything you need to run smarter.
          </h2>
        </div>
      </Reveal>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Reveal delay={0} className='md:col-span-2'>
          <Card className='bg-card border-border flex h-full flex-col items-center gap-10 rounded-2xl p-9 !shadow-none md:flex-row'>
            <div className='max-w-[400px] flex-none'>
              <div className='mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10'>
                <ChartLineIcon />
              </div>
              <h3 className='font-inter text-foreground mb-2.5 text-xl font-bold tracking-tight'>
                Real-time Overview
              </h3>
              <p className='font-inter text-muted-foreground m-0 text-[15px] leading-relaxed'>
                See revenue, sales, subscriptions, and active users update live.
                No refresh needed. Your business pulse, in real-time.
              </p>
            </div>
            <div className='w-full min-w-0 flex-1'>
              <div className='grid grid-cols-2 gap-2'>
                {MINI_KPIS.map((k) => (
                  <div
                    key={k.label}
                    className='bg-muted/30 border-border rounded-xl border p-3.5'
                  >
                    <div className='font-inter text-muted-foreground mb-1.5 text-[10px]'>
                      {k.label}
                    </div>
                    <div className='font-inter text-foreground mb-1 text-xl font-bold'>
                      {k.value}
                    </div>
                    <div className='font-inter text-[11px] text-emerald-500'>
                      {k.trend}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card className='bg-card border-border h-full rounded-2xl p-9 !shadow-none'>
            <div className='mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10'>
              <BarChartIcon />
            </div>
            <h3 className='font-inter text-foreground mb-2.5 text-xl font-bold tracking-tight'>
              Revenue Charts
            </h3>
            <p className='font-inter text-muted-foreground m-0 text-[15px] leading-relaxed'>
              Monthly bar charts and trend lines that tell the story behind the
              numbers — not just what happened, but why.
            </p>
          </Card>
        </Reveal>

        <Reveal delay={160}>
          <Card className='bg-card border-border h-full rounded-2xl p-9 !shadow-none'>
            <div className='mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10'>
              <ActivityIcon />
            </div>
            <h3 className='font-inter text-foreground mb-2.5 text-xl font-bold tracking-tight'>
              Recent Activity Feed
            </h3>
            <p className='font-inter text-muted-foreground m-0 text-[15px] leading-relaxed'>
              Every new sale, subscription, or event appears instantly. Know
              exactly what's happening right now, without refreshing.
            </p>
          </Card>
        </Reveal>

        <Reveal delay={240} className='md:col-span-2'>
          <Card className='bg-card border-border rounded-2xl p-9 !shadow-none'>
            <div className='mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10'>
              <AnalyticsIcon />
            </div>
            <h3 className='font-inter text-foreground mb-2.5 text-xl font-bold tracking-tight'>
              Analytics Deep Dive
            </h3>
            <p className='font-inter text-muted-foreground m-0 max-w-[600px] text-[15px] leading-relaxed'>
              Go beyond the overview. Filter by date, segment, or channel to
              find what's actually driving growth — and what's holding it back.
            </p>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
