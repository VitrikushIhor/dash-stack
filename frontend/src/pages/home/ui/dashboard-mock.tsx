import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/core/card'

const KPI_DATA = [
  { label: 'Total Revenue', value: '$45,231', change: '+20.1%' },
  { label: 'Subscriptions', value: '+2,350', change: '+180.1%' },
  { label: 'Sales', value: '+12,234', change: '+19%' },
  { label: 'Active Now', value: '+573', change: '+201 since last hr' },
]

const BAR_HEIGHTS = [45, 72, 55, 88, 60, 95, 70, 82, 65, 90, 78, 100]
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

const SALES_DATA = [
  { initials: 'OM', name: 'Olivia Martin', amount: '+$1,999' },
  { initials: 'JL', name: 'Jackson Lee', amount: '+$39' },
  { initials: 'IN', name: 'Isabella Nguyen', amount: '+$299' },
  { initials: 'WK', name: 'William Kim', amount: '+$99' },
  { initials: 'SD', name: 'Sofia Davis', amount: '+$39' },
]

export function DashboardMock() {
  return (
    <div
      aria-hidden='true'
      className='bg-card border-border font-inter pointer-events-none rounded-2xl border p-5 shadow-2xl select-none'
    >
      <div className='mb-4 flex items-center gap-1.5'>
        <div className='h-2.5 w-2.5 rounded-full bg-[#ff5f57]' />
        <div className='h-2.5 w-2.5 rounded-full bg-[#febc2e]' />
        <div className='h-2.5 w-2.5 rounded-full bg-[#28c840]' />
        <div className='bg-border ml-2 h-[1px] flex-1' />
        <span className='text-muted-foreground text-[10px]'>
          Dashboard &mdash; Overview
        </span>
      </div>

      <div className='mb-3.5 grid grid-cols-2 gap-2'>
        {KPI_DATA.map((kpi) => (
          <Card
            key={kpi.label}
            className='bg-muted/30 border-border !space-y-0 rounded-xl !p-2.5'
          >
            <CardHeader className='!p-0 !pb-1'>
              <CardTitle className='text-muted-foreground text-[9px] font-medium tracking-wider uppercase'>
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent className='!p-0'>
              <div className='text-foreground mb-0.5 text-base font-bold'>
                {kpi.value}
              </div>
              <div className='text-[9px] text-emerald-500'>{kpi.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <Card className='bg-muted/30 border-border !space-y-0 rounded-xl !p-3'>
          <CardHeader className='!p-0 !pb-2.5'>
            <CardTitle className='text-muted-foreground text-[10px] font-semibold'>
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent className='!p-0'>
            <div className='flex h-[60px] items-end gap-[3px]'>
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className='flex h-full flex-1 flex-col items-center justify-end'
                >
                  <div
                    className='w-full rounded-t-[2px] bg-emerald-500'
                    style={{ height: `${h}%`, opacity: 0.7 + (h / 100) * 0.3 }}
                  />
                  <div className='text-muted-foreground mt-[2px] text-[6px]'>
                    {MONTHS[i]}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='bg-muted/30 border-border !space-y-0 overflow-hidden rounded-xl !p-3'>
          <CardHeader className='!p-0 !pb-2'>
            <CardTitle className='text-muted-foreground text-[10px] font-semibold'>
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent className='!p-0'>
            <div className='flex flex-col gap-1.5'>
              {SALES_DATA.map((sale) => (
                <div key={sale.initials} className='flex items-center gap-1.5'>
                  <div className='flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-[7px] font-bold text-white'>
                    {sale.initials}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='text-foreground overflow-hidden text-[9px] font-semibold text-ellipsis whitespace-nowrap'>
                      {sale.name}
                    </div>
                  </div>
                  <div className='shrink-0 text-[9px] font-bold text-emerald-500'>
                    {sale.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
