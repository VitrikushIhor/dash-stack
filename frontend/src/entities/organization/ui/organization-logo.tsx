import Image from 'next/image'
import { cn } from '@/shared/lib/utils'

interface OrganizationLogoProps {
  name: string
  logo?: string | null
  className?: string
  size?: number
}

export function OrganizationLogo({
  name,
  logo,
  className,
  size = 32,
}: OrganizationLogoProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden font-bold',
        className
      )}
    >
      {logo ? (
        <Image
          src={logo}
          alt={name}
          width={size}
          height={size}
          className='size-full object-cover'
        />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  )
}
