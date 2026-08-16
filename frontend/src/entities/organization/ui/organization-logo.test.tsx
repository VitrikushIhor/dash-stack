import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OrganizationLogo } from './organization-logo'

describe('OrganizationLogo', () => {
  it('renders image when logo prop URL is provided', () => {
    render(
      <OrganizationLogo
        name='Stark Industries'
        logo='https://example.com/stark.png'
        size={40}
      />
    )

    const image = screen.getByRole('img', { name: 'Stark Industries' })
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src')
    expect(image.getAttribute('src')).toContain('stark.png')
  })

  it('renders uppercase first character fallback when no logo is provided', () => {
    render(<OrganizationLogo name='wayne enterprises' logo={null} />)

    expect(screen.getByText('W')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
