import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'

interface WrapperProps {
  children: ReactNode
}

function AllTheProviders({ children }: WrapperProps) {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export {
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
  within,
  renderHook,
} from '@testing-library/react'
export { customRender as render }
