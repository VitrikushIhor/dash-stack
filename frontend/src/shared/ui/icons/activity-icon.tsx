import { type SVGProps } from 'react'

export function ActivityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' {...props}>
      <circle cx='10' cy='10' r='7' stroke='#10b981' strokeWidth='1.5' />
      <path
        d='M7 10l2 2 4-4'
        stroke='#10b981'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
