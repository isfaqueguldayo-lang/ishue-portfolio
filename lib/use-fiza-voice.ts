'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

const PREFERRED_VOICES = ['jenny', 'aria', 'samantha', 'google uk english female', 'zira']
const FEMALE_HINTS = [
  'female', 'woman', 'jenny', 'aria', 'samantha', 'zira', 'victoria', 'karen', 'moira', 'tessa',
  'fiona', 'susan', 'hazel', 'libby', 'sonia', 'natasha', 'michelle', 'emma', 'ava', 'allison',
  'serena', 'kate', 'joanna', 'salli', 'kimberly', 'ivy', 'heera', 'neerja', 'swara', 'uzma', 'gul',
]
const ARABIC_SCRIPT = /[\u0600-\u06FF\u0750-\u077F]/
const PITCH = 1.08
const RATE = 0.96
const MAX_CHUNK_LENGTH = 200

const noopSubscribe = () => () => {}

function isFemale(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase()
  return FEMALE_HINTS.some((hint) => name.includes(hint))
}

function pickVoice(voices: SpeechSynthesisVoice[], text: string) {
  if (ARABIC_SCRIPT.test(text)) {
    const nativeVoices = voices.filter((voice) => /^(ur|sd)\b/i.test(voice.lang))
    return nativeVoices.find(isFemale) ?? nativeVoices[0] ?? null
  }

  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'))
  const pool = english.length > 0 ? english : voices
  const naturalFemale = pool.find((voice) => /natural/i.test(voice.name) && isFemale(voice))
  if (naturalFemale) return naturalFemale

  for (const preferred of PREFERRED_VOICES) {
    const match = pool.find((voice) => voice.name.toLowerCase().includes(preferred))
    if (match) return match
  }
  return pool.find(isFemale) ?? pool[0] ?? null
}

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

function toChunks(text: string) {
  const sentences = text.match(/[^.!?۔؟]+[.!?۔؟]*/g) ?? [text]
  const chunks: string[] = []
  for (const sentence of sentences) {
    const last = chunks[chunks.length - 1]
    if (last && last.length + sentence.length <= MAX_CHUNK_LENGTH) chunks[chunks.length - 1] = last + sentence
    else chunks.push(sentence)
  }
  return chunks.map((chunk) => chunk.trim()).filter(Boolean)
}

export function useFizaSpeech() {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => 'speechSynthesis' in window,
    () => false,
  )
  const [isSpeaking, setIsSpeaking] = useState(false)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    const loadVoices = () => {
      voicesRef.current = synth.getVoices()
    }
    loadVoices()
    synth.addEventListener('voiceschanged', loadVoices)
    return () => {
      synth.removeEventListener('voiceschanged', loadVoices)
      synth.cancel()
    }
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [supported])

  const speak = useCallback(
    (text: string) => {
      if (!supported) return
      const synth = window.speechSynthesis
      synth.cancel()

      const speakable = toSpeakableText(text)
      if (!speakable) return

      const voice = pickVoice(voicesRef.current.length ? voicesRef.current : synth.getVoices(), speakable)
      const chunks = toChunks(speakable)
      chunks.forEach((chunk, index) => {
        const utterance = new SpeechSynthesisUtterance(chunk)
        if (voice) {
          utterance.voice = voice
          utterance.lang = voice.lang
        } else if (ARABIC_SCRIPT.test(chunk)) {
          utterance.lang = 'ur-PK'
        }
        utterance.pitch = PITCH
        utterance.rate = RATE
        if (index === 0) utterance.onstart = () => setIsSpeaking(true)
        if (index === chunks.length - 1) utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        synth.speak(utterance)
      })
    },
    [supported],
  )

  return { supported, isSpeaking, speak, stop }
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
