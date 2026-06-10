import { useEffect } from 'react'
import { type EventEmitter } from './event-emitter'

export function useEmitterEvent<
  T extends Record<string, unknown>,
  K extends keyof T,
>(emitter: EventEmitter<T>, event: K, handler: (payload: T[K]) => void) {
  useEffect(() => {
    const unsubscribe = emitter.on(event, handler)
    return () => unsubscribe()
  }, [emitter, event, handler])
}
