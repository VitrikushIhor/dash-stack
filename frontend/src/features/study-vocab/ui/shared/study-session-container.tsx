import React from 'react'

interface StudySessionContainerProps {
  children: React.ReactNode
}

export function StudySessionContainer({
  children,
}: StudySessionContainerProps) {
  return (
    <div className='container mx-auto min-h-150 max-w-5xl px-4 py-6 sm:px-6'>
      {children}
    </div>
  )
}
