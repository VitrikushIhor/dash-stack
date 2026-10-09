import { describe, expect, it } from 'vitest'
import nextConfig from '../../../next.config'

describe('Next.js transport limits', () => {
  it('should_reserve_transport_headroom_above_the_import_payload_limit', () => {
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe('5mb')
  })
})
