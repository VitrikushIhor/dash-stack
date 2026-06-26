import { type SVGProps } from 'react'

export function BarChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' {...props}>
      <rect x='2' y='10' width='3' height='8' rx='1' fill='#10b981' />
      <rect
        x='7'
        y='6'
        width='3'
        height='12'
        rx='1'
        fill='#10b981'
        opacity='0.8'
      />
      <rect
        x='12'
        y='3'
        width='3'
        height='15'
        rx='1'
        fill='#10b981'
        opacity='0.6'
      />
      <rect
        x='17'
        y='1'
        width='1'
        height='17'
        rx='0.5'
        fill='#10b981'
        opacity='0.3'
      />
    </svg>
  )
}
