import React, { type ReactNode } from 'react'

function Root({ children }: { children: ReactNode }) {
  return (
    <div className='mx-auto flex min-h-150 w-full max-w-4xl flex-col px-4 py-8'>
      {children}
    </div>
  )
}

function Progress({ progress }: { progress: number }) {
  const value = Math.round(Math.min(100, Math.max(0, progress)) * 100) / 100

  return (
    <div className='bg-secondary mb-8 h-2 w-full overflow-hidden rounded-full'>
      <div
        className='bg-primary h-full transition-all duration-300 ease-out'
        role='progressbar'
        aria-label='Session progress'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function Header({ children }: { children: ReactNode }) {
  return (
    <div className='text-muted-foreground mb-8 flex items-center justify-between text-sm font-medium'>
      {children}
    </div>
  )
}

function Content({ children }: { children: ReactNode }) {
  return <div className='flex flex-1 flex-col justify-center'>{children}</div>
}

function Footer({ children }: { children: ReactNode }) {
  return <div className='mt-10 flex h-14 justify-center gap-4'>{children}</div>
}

export const StudySessionView = Object.assign(Root, {
  Progress,
  Header,
  Content,
  Footer,
})
