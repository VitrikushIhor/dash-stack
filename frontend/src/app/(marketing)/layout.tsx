import { LandingFooter } from '@/widgets/landing-footer'
import { LandingNavbar } from '@/widgets/landing-navbar'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='bg-background text-foreground min-h-screen font-sans'>
      <LandingNavbar />
      <main id='main-content'>{children}</main>
      <LandingFooter />
    </div>
  )
}
