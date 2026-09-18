'use client'

import { useCallback, useEffect, useId, useRef } from 'react'

interface UseSpeechOptions {
  lang?: string
  pitch?: number
  rate?: number
  volume?: number
}

interface SpeakOptions extends UseSpeechOptions {
  eventKey?: string
}

type ActiveSpeech = {
  eventKey?: string
  ownerId: string
  utterance: SpeechSynthesisUtterance
}

type SpeechController = {
  activeSpeech: ActiveSpeech | null
  spokenEventKeys: Set<string>
}

type PendingSpeech = {
  options?: SpeakOptions
  text: string
}

const controllers = new WeakMap<SpeechSynthesis, SpeechController>()

const isSpeechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const findEnglishVoice = (voices: SpeechSynthesisVoice[]) =>
  voices.find((voice) => voice.lang.toLowerCase() === 'en-us') ??
  voices.find((voice) => voice.lang.toLowerCase() === 'en-gb') ??
  voices.find((voice) => voice.lang.toLowerCase() === 'en') ??
  voices.find((voice) => voice.lang.toLowerCase().startsWith('en-'))

const getController = (speech: SpeechSynthesis): SpeechController => {
  const existingController = controllers.get(speech)

  if (existingController) return existingController

  const controller: SpeechController = {
    activeSpeech: null,
    spokenEventKeys: new Set(),
  }

  controllers.set(speech, controller)

  return controller
}

const cancelOwnedSpeech = (speech: SpeechSynthesis, ownerId: string) => {
  const controller = getController(speech)
  const activeSpeech = controller.activeSpeech

  if (!activeSpeech || activeSpeech.ownerId !== ownerId) return

  if (activeSpeech.eventKey) {
    controller.spokenEventKeys.delete(activeSpeech.eventKey)
  }
  controller.activeSpeech = null
  speech.cancel()
}

export function useSpeech(defaultOptions: UseSpeechOptions = {}) {
  const ownerId = useId()
  const optionsRef = useRef(defaultOptions)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const pendingSpeechRef = useRef<PendingSpeech | null>(null)
  const pendingSpeechTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    optionsRef.current = defaultOptions
  }, [defaultOptions])

  const speakImmediately = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!isSpeechSupported() || !text.trim()) return

      const speech = window.speechSynthesis
      const controller = getController(speech)
      const finalOptions = { ...optionsRef.current, ...options }
      const activeSpeech = controller.activeSpeech

      if (
        activeSpeech?.ownerId === ownerId &&
        activeSpeech.utterance.text === text &&
        activeSpeech.utterance.lang === (finalOptions.lang ?? 'en-US')
      )
        return
      if (
        finalOptions.eventKey &&
        controller.spokenEventKeys.has(finalOptions.eventKey)
      ) {
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)

      utterance.lang = finalOptions.lang ?? 'en-US'
      if (finalOptions.pitch !== undefined) {
        utterance.pitch = clamp(finalOptions.pitch, 0, 2)
      }
      if (finalOptions.rate !== undefined) {
        utterance.rate = clamp(finalOptions.rate, 0.1, 10)
      }
      if (finalOptions.volume !== undefined) {
        utterance.volume = clamp(finalOptions.volume, 0, 1)
      }

      const voice = findEnglishVoice(voicesRef.current)

      if (voice) utterance.voice = voice

      const previousSpeech = controller.activeSpeech

      if (previousSpeech) {
        if (previousSpeech.eventKey) {
          controller.spokenEventKeys.delete(previousSpeech.eventKey)
        }
        speech.cancel()
      }

      controller.activeSpeech = {
        eventKey: finalOptions.eventKey,
        ownerId,
        utterance,
      }
      utterance.onend = () => {
        if (controller.activeSpeech?.utterance === utterance) {
          controller.activeSpeech = null
        }
      }
      utterance.onerror = () => {
        if (controller.activeSpeech?.utterance !== utterance) return
        if (finalOptions.eventKey) {
          controller.spokenEventKeys.delete(finalOptions.eventKey)
        }
        controller.activeSpeech = null
      }

      speech.speak(utterance)
      if (finalOptions.eventKey) {
        controller.spokenEventKeys.add(finalOptions.eventKey)
      }
    },
    [ownerId]
  )

  const clearPendingSpeech = useCallback(() => {
    if (pendingSpeechTimeoutRef.current !== null) {
      window.clearTimeout(pendingSpeechTimeoutRef.current)
      pendingSpeechTimeoutRef.current = null
    }
    pendingSpeechRef.current = null
  }, [])

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!isSpeechSupported() || !text.trim()) return

      if (options?.eventKey && voicesRef.current.length === 0) {
        clearPendingSpeech()
        pendingSpeechRef.current = { options, text }
        pendingSpeechTimeoutRef.current = window.setTimeout(() => {
          const pendingSpeech = pendingSpeechRef.current

          clearPendingSpeech()
          if (pendingSpeech) {
            speakImmediately(pendingSpeech.text, pendingSpeech.options)
          }
        }, 250)

        return
      }

      clearPendingSpeech()
      speakImmediately(text, options)
    },
    [clearPendingSpeech, speakImmediately]
  )

  useEffect(() => {
    if (!isSpeechSupported()) return

    const speech = window.speechSynthesis
    const loadVoices = () => {
      voicesRef.current = speech.getVoices()
      const pendingSpeech = pendingSpeechRef.current

      if (!pendingSpeech || voicesRef.current.length === 0) return

      clearPendingSpeech()
      speakImmediately(pendingSpeech.text, pendingSpeech.options)
    }

    loadVoices()
    speech.addEventListener('voiceschanged', loadVoices)

    return () => {
      speech.removeEventListener('voiceschanged', loadVoices)
      clearPendingSpeech()
      cancelOwnedSpeech(speech, ownerId)
    }
  }, [clearPendingSpeech, ownerId, speakImmediately])

  const stop = useCallback(() => {
    if (!isSpeechSupported()) return
    clearPendingSpeech()
    cancelOwnedSpeech(window.speechSynthesis, ownerId)
  }, [clearPendingSpeech, ownerId])

  return {
    isSupported: isSpeechSupported(),
    speak,
    stop,
  }
}
