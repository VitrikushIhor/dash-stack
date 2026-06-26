import { type SVGProps } from 'react'

export function AnalyticsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' {...props}>
      <path
        d='M3 5h14M3 10h8M3 15h5'
        stroke='#10b981'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
      <circle cx='15' cy='14' r='3' stroke='#10b981' strokeWidth='1.5' />
      <path
        d='M17.1 16.1l1.9 1.9'
        stroke='#10b981'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  )
}
