const isDev = import.meta.env.DEV

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args)
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(...args)
    }
  },
  error: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(...args)
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug(...args)
    }
  },
}
