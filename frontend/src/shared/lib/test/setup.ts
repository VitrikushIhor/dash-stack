import React from 'react'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

globalThis.React = React

// Mock server-only package for tests
vi.mock('server-only', () => ({}))

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver

// Polyfill crypto.randomUUID for JSDOM
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () =>
        Math.random().toString(36).substring(2) + Date.now().toString(36),
    },
    configurable: true,
  })
} else if (typeof globalThis.crypto.randomUUID === 'undefined') {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: () =>
      Math.random().toString(36).substring(2) + Date.now().toString(36),
    configurable: true,
  })
}

// Polyfill fetch with a more complete mock
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve(
    new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  )
)
