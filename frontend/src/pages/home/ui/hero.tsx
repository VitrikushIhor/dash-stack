import { Link } from '@tanstack/react-router'
import { Button } from '@/shared/ui/core/button'
import { Reveal } from '@/shared/ui/reveal'
import { DashboardMock } from './dashboard-mock'

export function Hero() {
  return (
    <section className='mx-auto flex min-h-screen max-w-7xl flex-col items-center gap-[60px] px-6 pt-[100px] pb-[80px] md:flex-row md:pt-[120px]'>
      <div className='w-full flex-none md:w-1/2 md:max-w-[520px]'>
        <Reveal>
          <div className='mb-7 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5'>
            <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500' />
            <span className='font-inter text-xs font-medium tracking-wider text-emerald-500 uppercase'>
              Real-time Business Intelligence
            </span>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 className='font-inter text-foreground mb-5 text-[clamp(38px,5vw,60px)] leading-[1.1] font-extrabold tracking-tight'>
            Your business,{' '}
            <span className='text-emerald-500'>on one screen.</span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className='font-inter text-muted-foreground mb-9 max-w-[440px] text-lg leading-relaxed'>
            Dash Stack gives you a live view of revenue, sales, and growth — so
            you stop guessing and start deciding.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className='mb-5 flex flex-wrap gap-3'>
            <Button
              className='rounded-xl bg-emerald-500 px-6 py-6 text-[15px] text-white hover:bg-emerald-600'
              asChild
            >
              <Link to='/sign-up'>Start for free &rarr;</Link>
            </Button>
            <Button
              variant='outline'
              className='border-border hover:border-foreground text-muted-foreground hover:text-foreground rounded-xl px-6 py-6 text-[15px]'
              asChild
            >
              <a href='#demo'>See live demo</a>
            </Button>
          </div>
          <p className='font-inter text-muted-foreground text-[13px]'>
            No credit card required &middot; Takes 2 minutes to set up
          </p>
        </Reveal>
      </div>

      <div id='demo' className='w-full min-w-0 flex-1'>
        <Reveal delay={300}>
          <DashboardMock />
        </Reveal>
      </div>
    </section>
  )
}
