import { type SVGProps } from 'react'

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='28'
      height='28'
      viewBox='0 0 28 28'
      fill='none'
      aria-hidden='true'
      {...props}
    >
      <rect x='2' y='14' width='5' height='12' rx='1' fill='#10b981' />
      <rect
        x='9'
        y='9'
        width='5'
        height='17'
        rx='1'
        fill='#10b981'
        opacity='0.8'
      />
      <rect
        x='16'
        y='5'
        width='5'
        height='21'
        rx='1'
        fill='#10b981'
        opacity='0.6'
      />
      <rect
        x='23'
        y='2'
        width='2'
        height='24'
        rx='1'
        fill='#10b981'
        opacity='0.3'
      />
    </svg>
  )
}
