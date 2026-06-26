import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/shared/ui/core/button'
import { LogoIcon } from '@/shared/ui/icons'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Demo', href: '#demo' },
]

export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-background/90 border-border border-b backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6'>
        <Link
          to='/'
          className='flex items-center gap-2.5 no-underline'
          aria-label='Dash Stack home'
        >
          <LogoIcon />
          <span className='font-inter text-lg font-bold tracking-tight text-emerald-500'>
            Dash Stack
          </span>
        </Link>

        <div className='hidden items-center gap-8 md:flex'>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className='font-inter text-muted-foreground hover:text-foreground text-sm no-underline transition-colors'
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className='hidden items-center gap-3 md:flex'>
          <Button variant='outline' asChild>
            <Link to='/sign-in'>Sign In</Link>
          </Button>
          <Button
            className='bg-emerald-500 text-white hover:bg-emerald-600'
            asChild
          >
            <Link to='/sign-up'>Start Free</Link>
          </Button>
        </div>

        <button
          className='text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent p-1 md:hidden'
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label='Toggle menu'
          aria-expanded={menuOpen}
        >
          <svg width='22' height='22' viewBox='0 0 22 22' fill='none'>
            {menuOpen ? (
              <>
                <line
                  x1='4'
                  y1='4'
                  x2='18'
                  y2='18'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <line
                  x1='18'
                  y1='4'
                  x2='4'
                  y2='18'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </>
            ) : (
              <>
                <line
                  x1='3'
                  y1='7'
                  x2='19'
                  y2='7'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <line
                  x1='3'
                  y1='12'
                  x2='19'
                  y2='12'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <line
                  x1='3'
                  y1='17'
                  x2='19'
                  y2='17'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </>
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className='bg-background border-border flex flex-col gap-1 border-t px-6 py-4 pb-6 md:hidden'>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className='font-inter text-muted-foreground border-border/50 hover:text-foreground border-b py-2.5 text-base no-underline'
            >
              {link.label}
            </a>
          ))}
          <div className='mt-4 flex gap-3'>
            <Button variant='outline' className='flex-1' asChild>
              <Link to='/sign-in'>Sign In</Link>
            </Button>
            <Button
              className='flex-1 bg-emerald-500 text-white hover:bg-emerald-600'
              asChild
            >
              <Link to='/sign-up'>Start Free</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
