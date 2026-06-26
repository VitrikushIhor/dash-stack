import { type SVGProps } from 'react'

export function ChartLineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' {...props}>
      <path
        d='M2 14l4-4 3 3 4-5 4 2'
        stroke='#10b981'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
