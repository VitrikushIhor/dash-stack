type EventMap = Record<string, unknown>
type Listener<T> = (payload: T) => void

export class EventEmitter<T extends EventMap> {
  private events: { [K in keyof T]?: Set<Listener<T[K]>> } = {}

  on<K extends keyof T>(event: K, listener: Listener<T[K]>): () => void {
    if (!this.events[event]) {
      this.events[event] = new Set()
    }
    this.events[event]!.add(listener)
    return () => this.off(event, listener)
  }

  off<K extends keyof T>(event: K, listener: Listener<T[K]>): void {
    this.events[event]?.delete(listener)
    if (this.events[event]?.size === 0) {
      delete this.events[event]
    }
  }

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    this.events[event]?.forEach((listener) => listener(payload))
  }

  once<K extends keyof T>(event: K, listener: Listener<T[K]>): () => void {
    const unsubscribe = this.on(event, (payload) => {
      unsubscribe()
      listener(payload)
    })
    return unsubscribe
  }

  clear<K extends keyof T>(event?: K): void {
    if (event) {
      delete this.events[event]
      return
    }
    this.events = {}
  }

  bindEmit<K extends keyof T>(event: K): Listener<T[K]> {
    return (payload) => this.emit(event, payload)
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type GlobalEvents = {}

export const globalEventEmitter = new EventEmitter<GlobalEvents>()
