import { type SVGProps } from 'react'

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='10'
      height='10'
      viewBox='0 0 16 16'
      fill='none'
      aria-hidden='true'
      {...props}
    >
      <path
        d='M3 8l3 3 7-7'
        stroke='#10b981'
        strokeWidth='2.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
