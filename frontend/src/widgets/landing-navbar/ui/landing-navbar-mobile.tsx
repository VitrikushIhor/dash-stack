'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LandingNavbarAuth } from './landing-navbar-auth'

interface NavLink {
  label: string
  href: string
}

interface LandingNavbarMobileProps {
  navLinks: NavLink[]
}

export function LandingNavbarMobile({ navLinks }: LandingNavbarMobileProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <button
        type='button'
        className='text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent p-1 md:hidden'
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label='Toggle menu'
        aria-expanded={menuOpen}
      >
        {menuOpen ? (
          <X className='h-5.5 w-5.5' />
        ) : (
          <Menu className='h-5.5 w-5.5' />
        )}
      </button>

      {menuOpen && (
        <div className='bg-background border-border flex flex-col gap-1 border-t px-6 py-4 pb-6 md:hidden'>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className='font-inter text-muted-foreground border-border/50 hover:text-foreground border-b py-2.5 text-base no-underline'
            >
              {link.label}
            </a>
          ))}
          <div className='mt-4 flex flex-col gap-3'>
            <LandingNavbarAuth variant='mobile' />
          </div>
        </div>
      )}
    </>
  )
}
