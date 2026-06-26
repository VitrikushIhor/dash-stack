import { Link } from '@tanstack/react-router'
import { Badge } from '@/shared/ui/core/badge'
import { Button } from '@/shared/ui/core/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/shared/ui/core/card'
import { CheckIcon } from '@/shared/ui/icons'
import { Reveal } from '@/shared/ui/reveal'
import { PRICING } from '../model/constants'

export function Pricing() {
  return (
    <section id='pricing' className='mx-auto max-w-7xl px-6 py-24'>
      <Reveal>
        <div className='mb-14 text-left'>
          <p className='font-inter mb-3 text-xs font-semibold tracking-widest text-emerald-500 uppercase'>
            Pricing
          </p>
          <h2 className='font-inter text-foreground m-0 mb-3 text-[clamp(28px,3.5vw,44px)] font-extrabold tracking-tight'>
            Simple, transparent pricing.
          </h2>
          <p className='font-inter text-muted-foreground m-0 text-base'>
            Start free. Scale when you're ready.
          </p>
        </div>
      </Reveal>

      <div className='grid grid-cols-1 items-start gap-5 md:grid-cols-3'>
        {PRICING.map((tier, i) => (
          <Reveal key={tier.name} delay={i * 80}>
            <Card
              className={`relative flex h-full flex-col rounded-2xl p-8 ${
                tier.highlighted
                  ? 'border-emerald-500/35 bg-emerald-500/5 !shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]'
                  : 'bg-card border-border !shadow-none'
              }`}
            >
              {tier.badge && (
                <Badge className='font-inter absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border-none bg-emerald-500 px-3.5 py-1 text-[11px] font-bold whitespace-nowrap text-white hover:bg-emerald-500'>
                  {tier.badge}
                </Badge>
              )}

              <CardHeader className='!mb-2 !p-0'>
                <CardTitle className='font-inter text-foreground text-base font-semibold'>
                  {tier.name}
                </CardTitle>
              </CardHeader>

              <CardContent className='flex-1 !p-0'>
                <div className='mb-2 flex items-baseline gap-1'>
                  <span className='font-inter text-foreground text-4xl font-extrabold tracking-tight'>
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className='font-inter text-muted-foreground text-sm'>
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className='font-inter text-muted-foreground m-0 mb-6 text-sm leading-relaxed'>
                  {tier.description}
                </p>

                <div className='mb-7 flex flex-col gap-2.5'>
                  {tier.features.map((f) => (
                    <div key={f} className='flex items-center gap-2.5'>
                      <div className='flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10'>
                        <CheckIcon />
                      </div>
                      <span className='font-inter text-muted-foreground text-sm'>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className='mt-auto !p-0'>
                {tier.name === 'Enterprise' ? (
                  <Button
                    variant='outline'
                    className='border-border hover:border-foreground text-muted-foreground hover:text-foreground w-full rounded-xl bg-transparent py-6 text-sm font-semibold'
                    asChild
                  >
                    <a href='mailto:hello@dashstack.io'>{tier.cta}</a>
                  </Button>
                ) : (
                  <Button
                    className={`w-full rounded-xl py-6 text-sm font-semibold ${
                      tier.highlighted
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'border-border hover:border-foreground text-muted-foreground hover:text-foreground bg-transparent'
                    }`}
                    variant={tier.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to='/sign-up'>{tier.cta}</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
