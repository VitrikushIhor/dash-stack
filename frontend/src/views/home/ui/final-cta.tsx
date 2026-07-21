import { Link } from '@tanstack/react-router'
import { Button } from '@/shared/ui/core/button'
import { Reveal } from '@/shared/ui/reveal'

export function FinalCta() {
  return (
    <section className='bg-card border-border border-t px-6 py-24 text-center'>
      <Reveal>
        <h2 className='font-inter text-foreground m-0 mb-4 text-[clamp(28px,4vw,52px)] font-extrabold tracking-tight'>
          Ready to see your business clearly?
        </h2>
        <p className='font-inter text-muted-foreground mx-auto mb-9 max-w-[500px] text-lg'>
          Join thousands of teams who replaced spreadsheets with Dash Stack.
        </p>
        <Button
          className='mb-4 rounded-xl bg-emerald-500 px-8 py-7 text-base font-bold text-white hover:bg-emerald-600'
          asChild
        >
          <Link to='/sign-up'>Start for free &rarr;</Link>
        </Button>
        <p className='font-inter text-muted-foreground m-0 text-[13px]'>
          No credit card required
        </p>
      </Reveal>
    </section>
  )
}
