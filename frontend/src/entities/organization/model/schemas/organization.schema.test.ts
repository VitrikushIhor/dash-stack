import { describe, expect, it } from 'vitest'
import { OrganizationSlugSchema } from './organization.schema'

describe('OrganizationSlugSchema', () => {
  it('accepts valid slugs', () => {
    expect(() => OrganizationSlugSchema.parse('acme')).not.toThrow()
    expect(() => OrganizationSlugSchema.parse('acme-corp')).not.toThrow()
    expect(() => OrganizationSlugSchema.parse('a123-b456')).not.toThrow()
    expect(() => OrganizationSlugSchema.parse('12345')).not.toThrow()
  })

  it('rejects invalid slugs (preventing path traversal and injection)', () => {
    // Path traversal
    expect(() => OrganizationSlugSchema.parse('../admin')).toThrow()
    expect(() => OrganizationSlugSchema.parse('acme/corp')).toThrow()
    expect(() => OrganizationSlugSchema.parse('acme\\corp')).toThrow()

    // Invalid characters
    expect(() => OrganizationSlugSchema.parse('ACME')).toThrow() // uppercase not allowed
    expect(() => OrganizationSlugSchema.parse('acme_corp')).toThrow() // underscores not allowed
    expect(() => OrganizationSlugSchema.parse('acme corp')).toThrow() // spaces not allowed
    expect(() => OrganizationSlugSchema.parse('acme@corp')).toThrow()

    // Boundary checks
    expect(() => OrganizationSlugSchema.parse('-acme')).toThrow() // leading hyphen
    expect(() => OrganizationSlugSchema.parse('acme-')).toThrow() // trailing hyphen
    expect(() => OrganizationSlugSchema.parse('acme--corp')).toThrow() // consecutive hyphens
  })

  it('enforces min and max length constraints', () => {
    expect(() => OrganizationSlugSchema.parse('')).toThrow()

    const longSlug = 'a'.repeat(101)
    expect(() => OrganizationSlugSchema.parse(longSlug)).toThrow()
  })
})
