import { Card } from '@/shared/ui/core/card'
import { Reveal } from '@/shared/ui/reveal'

const BEFORE_ITEMS = [
  'Jumping between Google Analytics, Stripe, CRM, and spreadsheets',
  'Building weekly reports manually every Monday morning',
  'Finding out about a sales drop 2 days later',
  'No idea who your best customers are right now',
]

const AFTER_ITEMS = [
  'All metrics in one place, updated in real-time',
  'Auto-generated reports — ready before your morning coffee',
  'Instant alerts when something changes',
  'Your top customers and trends — always visible',
]

export function ProblemSolution() {
  return (
    <section className='mx-auto max-w-7xl px-6 py-24'>
      <Reveal>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <Card className='bg-muted/50 border-border rounded-2xl p-9 !shadow-none'>
            <div className='font-inter text-muted-foreground mb-5 text-[11px] font-semibold tracking-widest uppercase'>
              Before Dash Stack
            </div>
            <div className='flex flex-col gap-3.5'>
              {BEFORE_ITEMS.map((item) => (
                <div key={item} className='flex items-start gap-3'>
                  <span className='mt-[1px] shrink-0 text-base'>❌</span>
                  <p className='font-inter text-muted-foreground m-0 text-[15px] leading-relaxed'>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className='rounded-2xl border-emerald-500/15 bg-emerald-500/5 p-9 !shadow-none'>
            <div className='font-inter mb-5 text-[11px] font-semibold tracking-widest text-emerald-500 uppercase'>
              With Dash Stack
            </div>
            <div className='flex flex-col gap-3.5'>
              {AFTER_ITEMS.map((item) => (
                <div key={item} className='flex items-start gap-3'>
                  <span className='mt-[1px] shrink-0 text-base'>✅</span>
                  <p className='font-inter text-foreground m-0 text-[15px] leading-relaxed'>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Reveal>
    </section>
  )
}
