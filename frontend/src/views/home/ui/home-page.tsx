import { Features } from './features'
import { FinalCta } from './final-cta'
import { Hero } from './hero'
import { HowItWorks } from './how-it-works'
import { Pricing } from './pricing'
import { ProblemSolution } from './problem-solution'
import { StatsStrip } from './stats-strip'

export function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSolution />
      <StatsStrip />
      <Features />
      <HowItWorks />
      <Pricing />
      <FinalCta />
    </>
  )
}
