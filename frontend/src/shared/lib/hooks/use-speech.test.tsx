import { StrictMode, useEffect } from 'react'
import { act, render, renderHook } from '@testing-library/react'
import { type Mock, afterEach, describe, expect, it, vi } from 'vitest'
import { useSpeech } from './use-speech'

type SpeechFixture = {
  cancel: Mock<() => void>
  speak: Mock<(utterance: SpeechSynthesisUtterance) => void>
  getVoices: Mock<() => SpeechSynthesisVoice[]>
  addEventListener: Mock<
    (event: string, listener: EventListenerOrEventListenerObject) => void
  >
  removeEventListener: Mock<
    (event: string, listener: EventListenerOrEventListenerObject) => void
  >
  emitVoicesChanged: () => void
}

const voices = (...items: Array<{ name: string; lang: string }>) =>
  items.map(
    (item) =>
      ({
        ...item,
        default: false,
        localService: true,
        voiceURI: item.name,
      }) as SpeechSynthesisVoice
  )

function installSpeech(availableVoices: SpeechSynthesisVoice[]): SpeechFixture {
  let voicesChangedListener: (() => void) | null = null
  const fixture: SpeechFixture = {
    cancel: vi.fn(),
    speak: vi.fn(),
    getVoices: vi.fn(() => availableVoices),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    emitVoicesChanged: () => voicesChangedListener?.(),
  }

  const addEventListener = (
    event: string,
    listener: EventListenerOrEventListenerObject
  ) => {
    fixture.addEventListener(event, listener)
    if (event !== 'voiceschanged') return
    voicesChangedListener = () => {
      const voicesChangedEvent = new Event('voiceschanged')

      if (typeof listener === 'function') listener(voicesChangedEvent)
      else listener.handleEvent(voicesChangedEvent)
    }
  }
  const removeEventListener = (
    event: string,
    listener: EventListenerOrEventListenerObject
  ) => {
    fixture.removeEventListener(event, listener)
    if (event === 'voiceschanged') voicesChangedListener = null
  }
  const speechSynthesis = {
    cancel: () => fixture.cancel(),
    speak: (utterance: SpeechSynthesisUtterance) => fixture.speak(utterance),
    getVoices: () => fixture.getVoices(),
    addEventListener,
    removeEventListener,
  }

  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: speechSynthesis,
  })

  class MockUtterance {
    lang = ''
    voice: SpeechSynthesisVoice | null = null

    constructor(readonly text: string) {}
  }

  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: MockUtterance,
  })

  return fixture
}

afterEach(() => {
  Reflect.deleteProperty(window, 'speechSynthesis')
  Reflect.deleteProperty(window, 'SpeechSynthesisUtterance')
})

describe('useSpeech', () => {
  it('should_not_interrupt_the_same_term_while_it_is_speaking', () => {
    const speech = installSpeech(voices({ name: 'American', lang: 'en-US' }))
    const { result } = renderHook(() => useSpeech())

    act(() => {
      result.current.speak('hello')
      result.current.speak('hello')
    })
    expect(speech.speak).toHaveBeenCalledTimes(1)
    expect(speech.cancel).not.toHaveBeenCalled()
    const utterance = speech.speak.mock.calls[0]?.[0]

    if (!utterance) throw new Error('Expected an utterance')
    act(() => {
      utterance.onend?.call(utterance, new Event('end') as SpeechSynthesisEvent)
      result.current.speak('hello')
    })
    expect(speech.speak).toHaveBeenCalledTimes(2)
  })
  it('prefers an en-US voice', () => {
    const speech = installSpeech(
      voices(
        { name: 'British', lang: 'en-GB' },
        { name: 'American', lang: 'en-US' }
      )
    )
    const { result } = renderHook(() => useSpeech())

    act(() => result.current.speak('hello'))

    const utterance = speech.speak.mock
      .calls[0]?.[0] as SpeechSynthesisUtterance

    expect(utterance.lang).toBe('en-US')
    expect(utterance.voice?.name).toBe('American')
  })

  it('falls back to en-GB when en-US is unavailable', () => {
    const speech = installSpeech(voices({ name: 'British', lang: 'en-GB' }))
    const { result } = renderHook(() => useSpeech())

    act(() => result.current.speak('hello'))

    const utterance = speech.speak.mock
      .calls[0]?.[0] as SpeechSynthesisUtterance

    expect(utterance.voice?.name).toBe('British')
  })

  it('falls back to another English voice', () => {
    const speech = installSpeech(voices({ name: 'Australian', lang: 'en-AU' }))
    const { result } = renderHook(() => useSpeech())

    act(() => result.current.speak('hello'))

    const utterance = speech.speak.mock
      .calls[0]?.[0] as SpeechSynthesisUtterance

    expect(utterance.voice?.name).toBe('Australian')
  })

  it('falls back to a voice with the bare English language tag', () => {
    const speech = installSpeech(voices({ name: 'English', lang: 'en' }))
    const { result } = renderHook(() => useSpeech())

    act(() => result.current.speak('hello'))

    const utterance = speech.speak.mock
      .calls[0]?.[0] as SpeechSynthesisUtterance

    expect(utterance.voice?.name).toBe('English')
  })

  it('does not invoke unavailable browser speech APIs', () => {
    const { result } = renderHook(() => useSpeech())

    act(() => result.current.speak('hello'))

    expect(result.current.isSupported).toBe(false)
  })

  it('waits for asynchronously loaded voices before speaking a keyed request', () => {
    const availableVoices: SpeechSynthesisVoice[] = []
    const speech = installSpeech(availableVoices)
    const { result } = renderHook(() => useSpeech())

    act(() => result.current.speak('hello', { eventKey: 'reveal-card-1' }))
    expect(speech.speak).not.toHaveBeenCalled()

    availableVoices.push(...voices({ name: 'British', lang: 'en-GB' }))
    act(() => speech.emitVoicesChanged())

    const utterance = speech.speak.mock
      .calls[0]?.[0] as SpeechSynthesisUtterance

    expect(utterance.voice?.name).toBe('British')
  })

  it('clears a pending keyed request before immediate playback', () => {
    const availableVoices: SpeechSynthesisVoice[] = []
    const speech = installSpeech(availableVoices)
    const { result } = renderHook(() => useSpeech())

    act(() => result.current.speak('stale', { eventKey: 'reveal-card-1' }))
    act(() => result.current.speak('current'))
    availableVoices.push(...voices({ name: 'British', lang: 'en-GB' }))
    act(() => speech.emitVoicesChanged())

    expect(speech.speak).toHaveBeenCalledTimes(1)
    expect(
      (speech.speak.mock.calls[0]?.[0] as SpeechSynthesisUtterance).text
    ).toBe('current')
  })

  it('clears a pending keyed request when stopped', () => {
    const availableVoices: SpeechSynthesisVoice[] = []
    const speech = installSpeech(availableVoices)
    const { result } = renderHook(() => useSpeech())

    act(() => result.current.speak('stale', { eventKey: 'reveal-card-1' }))
    act(() => result.current.stop())
    availableVoices.push(...voices({ name: 'British', lang: 'en-GB' }))
    act(() => speech.emitVoicesChanged())

    expect(speech.speak).not.toHaveBeenCalled()
  })

  it('speaks a stable event key only once', () => {
    const speech = installSpeech(voices({ name: 'American', lang: 'en-US' }))
    const { result } = renderHook(() => useSpeech())

    act(() => {
      result.current.speak('hello', { eventKey: 'reveal-card-1' })
      result.current.speak('hello', { eventKey: 'reveal-card-1' })
    })

    expect(speech.speak).toHaveBeenCalledTimes(1)
  })

  it('replays a keyed request during StrictMode effect setup', () => {
    const speech = installSpeech(voices({ name: 'American', lang: 'en-US' }))

    function RevealSpeech() {
      const { speak } = useSpeech()

      useEffect(() => {
        speak('hello', { eventKey: 'reveal-card-1' })
      }, [speak])

      return null
    }

    render(
      <StrictMode>
        <RevealSpeech />
      </StrictMode>
    )

    expect(speech.speak).toHaveBeenCalledTimes(2)
  })

  it('does not cancel another hook instance speech on cleanup', () => {
    const speech = installSpeech(voices({ name: 'American', lang: 'en-US' }))
    const first = renderHook(() => useSpeech())
    const second = renderHook(() => useSpeech())

    act(() => first.result.current.speak('hello'))
    second.unmount()

    expect(speech.cancel).not.toHaveBeenCalled()
  })

  it('cancels owned speech and unregisters the voice listener on cleanup', () => {
    const speech = installSpeech(voices({ name: 'American', lang: 'en-US' }))
    const { result, unmount } = renderHook(() => useSpeech())

    act(() => result.current.speak('hello'))
    speech.cancel.mockClear()

    unmount()

    expect(speech.cancel).toHaveBeenCalledOnce()
    expect(speech.removeEventListener).toHaveBeenCalledWith(
      'voiceschanged',
      expect.any(Function)
    )
  })
})
