import { Reveal } from '@/shared/ui/reveal'

const STATS = [
  { value: '$2.4M+', label: 'Revenue tracked monthly' },
  { value: '12,000+', label: 'Active businesses' },
  { value: '99.9%', label: 'Uptime SLA' },
]

export function StatsStrip() {
  return (
    <section className='bg-card border-border border-y px-6 py-14'>
      <Reveal>
        <div className='mx-auto grid max-w-7xl grid-cols-1 gap-8 text-center md:grid-cols-3'>
          {STATS.map((s, i) => (
            <div key={i}>
              <div className='font-inter mb-2 text-[clamp(32px,4vw,52px)] font-extrabold tracking-tight text-emerald-500'>
                {s.value}
              </div>
              <div className='font-inter text-muted-foreground text-[15px]'>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
