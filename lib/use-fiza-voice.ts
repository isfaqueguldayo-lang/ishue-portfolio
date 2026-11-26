'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { MAX_TTS_LENGTH } from '@/lib/tts-config'

// A zero-length WAV used to unlock audio playback during a user gesture (needed on iOS Safari).
const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

const noopSubscribe = () => () => {}

export function toSpeakableText(text: string) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string) => (/^(https?:|mailto:|www\.)/i.test(label) ? '' : label))
    .replace(/(https?:\/\/|www\.)\S+/gi, '')
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
    .replace(/^\s*(?:[-*•]|\d+[.)])\s+/gm, '')
    .replace(/[*_~`#>|]/g, '')
    .replace(/\(\s*\)/g, '')
    .split('\n')
    .map((line) => line.trim().replace(/\s*:$/, ''))
    .filter(Boolean)
    .map((line) => (/[.!?:;,۔؟]$/.test(line) ? line : `${line}.`))
    .join(' ')
    .replace(/\s+([.,!?:;])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function useFizaSpeech() {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => typeof Audio !== 'undefined',
    () => false,
  )
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const requestRef = useRef<AbortController | null>(null)
  const unlockedRef = useRef(false)

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.preload = 'auto'
      audio.addEventListener('playing', () => setIsSpeaking(true))
      audio.addEventListener('ended', () => setIsSpeaking(false))
      audio.addEventListener('pause', () => setIsSpeaking(false))
      audio.addEventListener('error', () => setIsSpeaking(false))
      audioRef.current = audio
    }
    return audioRef.current
  }, [])

  const releaseAudio = useCallback(() => {
    requestRef.current?.abort()
    requestRef.current = null
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  useEffect(() => releaseAudio, [releaseAudio])

  const stop = useCallback(() => {
    releaseAudio()
    setIsSpeaking(false)
  }, [releaseAudio])

  const unlock = useCallback(() => {
    if (!supported || unlockedRef.current) return
    unlockedRef.current = true
    const audio = getAudio()
    audio.src = SILENT_AUDIO
    audio.play().catch(() => {
      unlockedRef.current = false
    })
  }, [getAudio, supported])

  const speak = useCallback(
    async (text: string) => {
      if (!supported) return
      releaseAudio()

      const speakable = toSpeakableText(text).slice(0, MAX_TTS_LENGTH)
      if (!speakable) return

      const controller = new AbortController()
      requestRef.current = controller

      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: speakable }),
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`TTS request failed with ${response.status}`)

        const blob = await response.blob()
        if (controller.signal.aborted) return

        const url = URL.createObjectURL(blob)
        objectUrlRef.current = url
        const audio = getAudio()
        audio.src = url
        await audio.play()
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('FIZA voice playback failed:', error)
          setIsSpeaking(false)
        }
      } finally {
        if (requestRef.current === controller) requestRef.current = null
      }
    },
    [getAudio, releaseAudio, supported],
  )

  return { supported, isSpeaking, speak, stop, unlock }
}

type RecognitionResultEvent = {
  resultIndex: number
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
}

type Recognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  onresult: ((event: RecognitionResultEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type RecognitionConstructor = new () => Recognition

function getRecognitionConstructor(): RecognitionConstructor | null {
  const speechWindow = window as unknown as {
    SpeechRecognition?: RecognitionConstructor
    webkitSpeechRecognition?: RecognitionConstructor
  }
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null
}

export function useSpeechInput({
  onInterim,
  onFinal,
  onError,
}: {
  onInterim: (text: string) => void
  onFinal: (text: string) => void
  onError: (message: string) => void
}) {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => getRecognitionConstructor() !== null,
    () => false,
  )
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<Recognition | null>(null)
  const handlersRef = useRef({ onInterim, onFinal, onError })

  useEffect(() => {
    handlersRef.current = { onInterim, onFinal, onError }
  })

  useEffect(
    () => () => {
      const recognition = recognitionRef.current
      if (!recognition) return
      recognition.onend = null
      recognition.onresult = null
      recognition.abort()
    },
    [],
  )

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    const Constructor = getRecognitionConstructor()
    if (!Constructor || recognitionRef.current) return

    const recognition = new Constructor()
    recognition.lang = navigator.language || 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

    let transcript = ''
    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) transcript += result[0].transcript
        else interim += result[0].transcript
      }
      handlersRef.current.onInterim(`${transcript}${interim}`.trim())
    }
    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return
      handlersRef.current.onError(
        event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? 'Microphone access was blocked. Please allow it in your browser settings.'
          : 'Sorry, I could not hear that. Please try again.',
      )
    }
    recognition.onend = () => {
      recognitionRef.current = null
      setIsListening(false)
      const finalText = transcript.trim()
      if (finalText) handlersRef.current.onFinal(finalText)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setIsListening(true)
    } catch {
      recognitionRef.current = null
      setIsListening(false)
    }
  }, [])

  return { supported, isListening, start, stop }
}
