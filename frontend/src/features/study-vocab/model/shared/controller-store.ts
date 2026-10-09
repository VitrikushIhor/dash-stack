export interface ControllerStore<TState> {
  getState: () => TState
  subscribe: (listener: () => void) => () => void
}

type SetControllerState<TState> = (next: Partial<TState>) => void
type GetControllerState<TState> = () => TState

export function createControllerStore<TState>(
  initialize: (
    set: SetControllerState<TState>,
    get: GetControllerState<TState>
  ) => TState
): ControllerStore<TState> {
  const listeners = new Set<() => void>()
  let state: TState

  const getState = () => state
  const set: SetControllerState<TState> = (next) => {
    state = { ...state, ...next }
    listeners.forEach((listener) => listener())
  }

  state = initialize(set, getState)

  return {
    getState,
    subscribe: (listener) => {
      listeners.add(listener)

      return () => listeners.delete(listener)
    },
  }
}
