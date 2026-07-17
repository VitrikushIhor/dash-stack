import { Card } from '@/shared/ui/core/card'
import { Reveal } from '@/shared/ui/reveal'

const STEPS = [
  {
    number: '01',
    title: 'Connect your data',
    description:
      'Link your store, payment processor, or CRM. Works with Stripe, Shopify, HubSpot, and more. No engineers needed.',
  },
  {
    number: '02',
    title: 'See your dashboard',
    description:
      'Your metrics appear instantly, organized and clear. Revenue, sales, subscriptions — all in one view.',
  },
  {
    number: '03',
    title: 'Make better decisions',
    description:
      'With real data in front of you, decisions happen faster. No more gut feelings. No more waiting for reports.',
  },
]

export function HowItWorks() {
  return (
    <section className='mx-auto max-w-7xl px-6 py-24'>
      <Reveal>
        <div className='mb-14'>
          <p className='font-inter mb-3 text-xs font-semibold tracking-widest text-emerald-500 uppercase'>
            How it works
          </p>
          <h2 className='font-inter text-foreground m-0 text-[clamp(28px,3.5vw,44px)] font-extrabold tracking-tight'>
            Up and running in minutes.
          </h2>
        </div>
      </Reveal>

      <div className='relative grid grid-cols-1 gap-6 md:grid-cols-3'>
        {STEPS.map((step, i) => (
          <Reveal key={step.number} delay={i * 100}>
            <Card className='bg-card border-border relative rounded-2xl p-8 !shadow-none'>
              <div className='font-inter mb-4 text-5xl leading-none font-black tracking-tighter text-emerald-500/10'>
                {step.number}
              </div>
              <h3 className='font-inter text-foreground mb-2.5 text-lg font-bold tracking-tight'>
                {step.title}
              </h3>
              <p className='font-inter text-muted-foreground m-0 text-sm leading-relaxed'>
                {step.description}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
