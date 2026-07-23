import Link from 'next/link'
import { buttonVariants } from '@/shared/ui/core/button'

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 text-center'>
      <h1 className='text-4xl font-bold'>404 - Page Not Found</h1>
      <p className='text-muted-foreground'>
        The page you are looking for does not exist.
      </p>
      <Link href='/' className={buttonVariants({ variant: 'outline' })}>
        Return Home
      </Link>
    </div>
  )
}
