'use client'

import { useCallback, useEffect, useRef } from 'react'

export interface UseSpeechOptions {
  lang?: string
  pitch?: number
  rate?: number
  volume?: number
}

const isSpeechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export function useSpeech(defaultOptions: UseSpeechOptions = {}) {
  const optionsRef = useRef(defaultOptions)

  useEffect(() => {
    optionsRef.current = defaultOptions
  }, [defaultOptions])

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  const speak = useCallback((text: string, options?: UseSpeechOptions) => {
    if (!isSpeechSupported() || !text.trim()) return

    const finalOptions = { ...optionsRef.current, ...options }
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

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (!isSpeechSupported()) return
    window.speechSynthesis.cancel()
  }, [])

  return {
    isSupported: isSpeechSupported(),
    speak,
    stop,
  }
}
