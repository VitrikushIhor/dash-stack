import { LandingFooter } from '@/widgets/landing-footer'
import { LandingNavbar } from '@/widgets/landing-navbar'
import { Features } from './features'
import { FinalCta } from './final-cta'
import { Hero } from './hero'
import { HowItWorks } from './how-it-works'
import { Pricing } from './pricing'
import { ProblemSolution } from './problem-solution'
import { StatsStrip } from './stats-strip'

export function HomePage() {
  return (
    <div className='bg-background text-foreground min-h-screen font-sans'>
      <LandingNavbar />
      <main id='main-content'>
        <Hero />
        <ProblemSolution />
        <StatsStrip />
        <Features />
        <HowItWorks />
        <Pricing />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
