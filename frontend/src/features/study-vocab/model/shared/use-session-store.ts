'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { type ControllerStore } from './controller-store'
import { type SessionLifecycle } from './session-lifecycle'

export function useController<T>(controller: ControllerStore<T>): T {
  return useSyncExternalStore(
    controller.subscribe,
    controller.getState,
    controller.getState
  )
}

export function useSessionStore<T extends SessionLifecycle>(
  controller: ControllerStore<T>
) {
  useEffect(() => {
    const lease = controller.getState().activate()

    return () => controller.getState().deactivate(lease)
  }, [controller])

  return useController(controller)
}
