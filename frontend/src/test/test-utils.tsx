import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'

interface WrapperProps {
  children: ReactNode
}

// eslint-disable-next-line react-refresh/only-export-components
function AllTheProviders({ children }: WrapperProps) {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from testing-library
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { customRender as render }
