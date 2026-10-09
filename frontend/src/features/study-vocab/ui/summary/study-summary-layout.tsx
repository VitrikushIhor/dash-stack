import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

interface StudySummaryLayoutProps {
  children: ReactNode
  actions: ReactNode
}

export function StudySummaryLayout({
  children,
  actions,
}: StudySummaryLayoutProps) {
  return (
    <div className='mx-auto flex min-h-150 w-full max-w-xl flex-col items-center justify-center p-6 text-center'>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className='bg-card border-border flex w-full flex-col items-center rounded-2xl border p-8 shadow-lg'
      >
        <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500'>
          <Trophy className='h-10 w-10' />
        </div>

        <h2 className='mb-2 text-3xl font-bold'>Session Complete!</h2>
        <p className='text-muted-foreground mb-8'>
          Great job! Keep reviewing regularly to build long-term memory.
        </p>

        {children}
        {actions}
      </motion.div>
    </div>
  )
}
