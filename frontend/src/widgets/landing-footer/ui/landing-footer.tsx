import { LogoIcon } from '@/shared/ui/icons'

const LINK_GROUPS = [
  { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
  { title: 'Resources', links: ['Blog', 'Docs', 'Status', 'Community'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
]

export function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className='bg-background border-border border-t px-6 pt-16 pb-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-12 grid grid-cols-1 gap-10 md:grid-cols-5'>
          <div className='md:col-span-2'>
            <div className='mb-4 flex items-center gap-2.5'>
              <LogoIcon />
              <span className='font-inter text-base font-bold text-emerald-500'>
                Dash Stack
              </span>
            </div>
            <p className='font-inter text-muted-foreground m-0 text-sm leading-relaxed'>
              Business intelligence, simplified.
            </p>
          </div>

          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <div className='font-inter text-foreground mb-4 text-xs font-semibold tracking-widest uppercase'>
                {group.title}
              </div>
              <div className='flex flex-col gap-2.5'>
                {group.links.map((link) => (
                  <span
                    key={link}
                    className='font-inter text-muted-foreground text-sm'
                  >
                    {link}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='border-border flex flex-wrap items-center justify-between gap-3 border-t pt-6'>
          <p className='font-inter text-muted-foreground m-0 text-[13px]'>
            © {year} Dash Stack. All rights reserved.
          </p>
          <p className='font-inter text-muted-foreground/50 m-0 text-[13px]'>
            Made with precision.
          </p>
        </div>
      </div>
    </footer>
  )
}
