import { LogoIcon } from '@/shared/ui/icons'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='container grid h-svh max-w-none items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
        <div className='mb-4 flex items-center justify-center'>
          <LogoIcon className='me-2' />
          <h1 className='text-xl font-medium'>Dash Stack</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
