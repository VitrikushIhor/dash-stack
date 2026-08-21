'use client'

import { useEffect, useRef, useState } from 'react'

interface LandingNavbarContainerProps {
  children: React.ReactNode
}

export function LandingNavbarContainer({
  children,
}: LandingNavbarContainerProps) {
  const [scrolled, setScrolled] = useState(false)
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => {
      if (throttleRef.current !== null) return
      throttleRef.current = setTimeout(() => {
        setScrolled(window.scrollY > 20)
        throttleRef.current = null
      }, 100)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (throttleRef.current !== null) clearTimeout(throttleRef.current)
    }
  }, [])

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-background/90 border-border border-b backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      {children}
    </header>
  )
}
