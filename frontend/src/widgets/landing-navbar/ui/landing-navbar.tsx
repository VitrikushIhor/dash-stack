import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { LogoIcon } from '@/shared/ui/icons'
import { LandingNavbarAuth } from './landing-navbar-auth'
import { LandingNavbarContainer } from './landing-navbar-container'
import { LandingNavbarMobile } from './landing-navbar-mobile'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Demo', href: '#demo' },
]

export function LandingNavbar() {
  return (
    <LandingNavbarContainer>
      <nav className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6'>
        <Link
          href={ROUTES.home}
          className='flex items-center gap-2.5 no-underline'
          aria-label='Dash Stack home'
        >
          <LogoIcon />
          <span className='font-inter text-primary text-lg font-bold tracking-tight'>
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
          <LandingNavbarAuth variant='desktop' />
        </div>

        <LandingNavbarMobile navLinks={NAV_LINKS} />
      </nav>
    </LandingNavbarContainer>
  )
}
