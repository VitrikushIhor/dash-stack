import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(
      screen.getByRole('button', { name: /click me/i })
    ).toBeInTheDocument()
  })

  it('should apply default variant styles', () => {
    render(<Button>Default</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-slot', 'button')
  })

  it('should be disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render with different variants', () => {
    const { rerender } = render(<Button variant='destructive'>Delete</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button variant='outline'>Outline</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button variant='ghost'>Ghost</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size='sm'>Small</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button size='lg'>Large</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button size='icon'>🔥</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render as child when asChild is true', () => {
    render(
      <Button asChild>
        <a href='/test'>Link Button</a>
      </Button>
    )
    expect(
      screen.getByRole('link', { name: /link button/i })
    ).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    render(<Button className='custom-class'>Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})
