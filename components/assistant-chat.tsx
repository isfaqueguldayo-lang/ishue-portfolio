'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUp, Mic, RotateCcw, Square, Volume2, VolumeX, X } from 'lucide-react'
import { useFizaSpeech, useSpeechInput } from '@/lib/use-fiza-voice'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const QUICK_QUESTIONS = [
  { label: 'Who is Ishfaq?', prompt: 'Who is Ishfaq?' },
  { label: 'Top Skills', prompt: 'What are Ishfaq’s top skills?' },
  { label: 'Projects', prompt: 'What projects has Ishfaq built?' },
  { label: 'Contact Info', prompt: 'How can I contact Ishfaq?' },
]

const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    "Hi there! I'm FIZA, Ishfaq Gul Dayo's personal AI guide. Ask me about his skills, projects, education, or how to get in touch—in English, Urdu, Roman Urdu, or Sindhi!",
}

const WHATSAPP_NUMBER = '923239285965'

export function AssistantChat({ onClose }: { onClose: () => void }) {
  const reduceMotion = useReducedMotion()
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const voiceEnabledRef = useRef(voiceEnabled)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const speech = useFizaSpeech()
  const stopSpeaking = speech.stop
  const sendMessageRef = useRef<(text: string) => void>(() => {})
  const speechInput = useSpeechInput({
    onInterim: (text) => setInput(text),
    onFinal: (text) => sendMessageRef.current(text),
    onError: (message) => setVoiceError(message),
  })

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled
  }, [voiceEnabled])

  useEffect(() => {
    sendMessageRef.current = sendMessage
  })

  useEffect(() => {
    inputRef.current?.focus()
    return () => abortRef.current?.abort()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        stopSpeaking()
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, stopSpeaking])

  async function sendMessage(text: string) {
    const content = text.trim()
    if (!content || isLoading) return

    speech.stop()
    if (voiceEnabledRef.current) speech.unlock()
    setVoiceError(null)
    let reply = ''
    const history = [...messages.slice(1), { role: 'user' as const, content }]
    setMessages((prev) => [...prev, { role: 'user', content }, { role: 'assistant', content: '' }])
    setInput('')
    setIsLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    const appendToReply = (chunk: string) => {
      reply += chunk
      setMessages((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        next[next.length - 1] = { ...last, content: last.content + chunk }
        return next
      })
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null)
        appendToReply(data?.error ?? 'Sorry, I could not answer that right now.')
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        appendToReply(decoder.decode(value, { stream: true }))
      }
    } catch {
      if (!controller.signal.aborted) {
        appendToReply('Sorry, I could not reach the assistant. Please try again.')
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        setIsLoading(false)
      }
      if (!controller.signal.aborted && voiceEnabledRef.current && reply.trim()) {
        speech.speak(reply)
      }
    }
  }

  function handleClose() {
    speech.stop()
    speechInput.stop()
    onClose()
  }

  function toggleVoice() {
    if (voiceEnabled) speech.stop()
    setVoiceEnabled(!voiceEnabled)
  }

  function toggleListening() {
    if (speechInput.isListening) {
      speechInput.stop()
      return
    }
    speech.stop()
    if (voiceEnabled) speech.unlock()
    setVoiceError(null)
    setInput('')
    speechInput.start()
  }

  function clearChat() {
    speech.stop()
    setVoiceError(null)
    abortRef.current?.abort()
    abortRef.current = null
    setIsLoading(false)
    setMessages([GREETING])
    setInput('')
    inputRef.current?.focus()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    sendMessage(input)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage(input)
    }
  }

  const showQuickQuestions = messages.length === 1
  const headerButtonClass =
    'rounded-full p-1.5 text-ink-foreground/70 transition-colors hover:bg-ink-foreground/10 hover:text-ink-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40'

  return (
    <motion.div
      role="dialog"
      aria-label="Chat with FIZA, Ishfaq's AI guide"
      className="mb-4 flex h-[min(32rem,calc(100dvh-8rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl shadow-foreground/15"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.92, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      style={{ transformOrigin: 'bottom right' }}
    >
      <header className="flex items-center gap-3 bg-ink px-4 py-3 text-ink-foreground">
        <span className="relative block size-9 shrink-0 overflow-hidden rounded-full border-2 border-ink-foreground/20">
          <Image src="/images/mascot.webp" alt="" width={72} height={72} className="size-full object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            FIZA <span className="font-normal text-ink-foreground/70">{"· Ishfaq's AI Guide"}</span>
          </p>
          <p className="flex items-center gap-1.5 truncate text-xs text-ink-foreground/70">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
            {speechInput.isListening
              ? 'Listening...'
              : isLoading
                ? 'FIZA is typing...'
                : speech.isSpeaking
                  ? 'FIZA is speaking...'
                  : 'Friendly Intelligent Zone Assistant'}
          </p>
        </div>
        {speech.supported && (
          <button
            type="button"
            onClick={toggleVoice}
            className={headerButtonClass}
            aria-pressed={voiceEnabled}
            aria-label={voiceEnabled ? 'Mute FIZA voice' : 'Unmute FIZA voice'}
            title={voiceEnabled ? 'Voice on' : 'Voice off'}
          >
            {voiceEnabled ? (
              <Volume2 className="size-4" aria-hidden="true" />
            ) : (
              <VolumeX className="size-4" aria-hidden="true" />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={clearChat}
          disabled={messages.length === 1}
          className={headerButtonClass}
          aria-label="Clear chat"
          title="Clear chat"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={handleClose} className={headerButtonClass} aria-label="Close chat" title="Close">
          <X className="size-4" aria-hidden="true" />
        </button>
      </header>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={
              message.role === 'user'
                ? 'max-w-[85%] self-end rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap text-primary-foreground'
                : 'max-w-[88%] self-start rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2.5 text-sm leading-relaxed break-words text-secondary-foreground'
            }
          >
            {message.content ? (
              message.role === 'assistant' ? (
                <FormattedReply text={message.content} />
              ) : (
                message.content
              )
            ) : (
              <TypingIndicator reduceMotion={Boolean(reduceMotion)} />
            )}
          </motion.div>
        ))}

        {showQuickQuestions && (
          <div className="mt-1 flex flex-wrap gap-2" aria-label="Suggested questions">
            {QUICK_QUESTIONS.map((question, index) => (
              <motion.button
                key={question.label}
                type="button"
                onClick={() => sendMessage(question.prompt)}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.06 }}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {question.label}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {voiceError && (
        <p role="alert" className="border-t border-border px-4 pt-2 text-xs text-destructive">
          {voiceError}
        </p>
      )}
      {speechInput.isListening && (
        <p className="flex items-center gap-2 px-4 pt-2 text-xs font-medium text-red-600" role="status">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-red-600" />
          </span>
          {'Listening... speak now'}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className={`flex items-end gap-2 p-3 ${voiceError || speechInput.isListening ? '' : 'border-t border-border'}`}
      >
        <label htmlFor="assistant-input" className="sr-only">
          Ask a question about Ishfaq
        </label>
        {speechInput.supported && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            aria-pressed={speechInput.isListening}
            aria-label={speechInput.isListening ? 'Stop recording' : 'Ask with your voice'}
            title={speechInput.isListening ? 'Stop recording' : 'Speak to FIZA'}
            className={`relative flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 ${
              speechInput.isListening
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-input bg-background text-foreground hover:border-primary hover:text-primary'
            }`}
          >
            {speechInput.isListening && (
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full bg-red-500/50 motion-reduce:animate-none"
              />
            )}
            {speechInput.isListening ? (
              <Square className="relative size-3.5 fill-current" aria-hidden="true" />
            ) : (
              <Mic className="relative size-4" aria-hidden="true" />
            )}
          </button>
        )}
        <textarea
          id="assistant-input"
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={2000}
          placeholder={speechInput.isListening ? 'Listening...' : 'Ask about Ishfaq...'}
          dir="auto"
          className="max-h-24 min-h-10 flex-1 resize-none rounded-2xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || input.trim().length === 0}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-ink-foreground transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
          aria-label="Send message"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
      </form>
    </motion.div>
  )
}

const INLINE_PATTERN =
  /(\*\*[^*]+\*\*)|\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:)[^\s)]+)\)|(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(\+?\d[\d\s-]{8,}\d)/g

function ChatLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors [overflow-wrap:anywhere] hover:decoration-primary"
    >
      {children}
    </a>
  )
}

function phoneHref(raw: string) {
  const digits = raw.replace(/\D/g, '')
  const international = digits.startsWith('03') ? `92${digits.slice(1)}` : digits
  return international === WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : `tel:+${international}`
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const [full, bold, linkLabel, linkHref, url, email, phone] = match
    const start = match.index ?? 0
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start))
    const key = `${start}-${full}`

    if (bold) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {renderInline(bold.slice(2, -2))}
        </strong>,
      )
    } else if (linkLabel && linkHref) {
      nodes.push(
        <ChatLink key={key} href={linkHref}>
          {linkLabel}
        </ChatLink>,
      )
    } else if (url) {
      nodes.push(
        <ChatLink key={key} href={url}>
          {url}
        </ChatLink>,
      )
    } else if (email) {
      nodes.push(
        <ChatLink key={key} href={`mailto:${email}`}>
          {email}
        </ChatLink>,
      )
    } else if (phone && phone.replace(/\D/g, '').length >= 10) {
      nodes.push(
        <ChatLink key={key} href={phoneHref(phone)}>
          {phone}
        </ChatLink>,
      )
    } else {
      nodes.push(full)
    }
    lastIndex = start + full.length
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

type Block = { type: 'paragraph'; text: string } | { type: 'list'; ordered: boolean; items: string[] }

function toBlocks(text: string): Block[] {
  const blocks: Block[] = []
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    const bullet = line.match(/^[*\-•]\s+(.*)$/)
    const numbered = line.match(/^\d+[.)]\s+(.*)$/)
    const item = bullet?.[1] ?? numbered?.[1]
    const last = blocks[blocks.length - 1]

    if (item !== undefined) {
      const ordered = Boolean(numbered)
      if (last?.type === 'list' && last.ordered === ordered) last.items.push(item)
      else blocks.push({ type: 'list', ordered, items: [item] })
    } else {
      blocks.push({ type: 'paragraph', text: line.replace(/^#+\s+/, '') })
    }
  }
  return blocks
}

function FormattedReply({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2" dir="auto">
      {toBlocks(text).map((block, index) => {
        if (block.type === 'paragraph') return <p key={index}>{renderInline(block.text)}</p>
        const ListTag = block.ordered ? 'ol' : 'ul'
        return (
          <ListTag key={index} className="flex flex-col gap-1">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex gap-2">
                <span aria-hidden="true" className="shrink-0 font-medium text-primary">
                  {block.ordered ? `${itemIndex + 1}.` : '•'}
                </span>
                <span className="min-w-0">{renderInline(item)}</span>
              </li>
            ))}
          </ListTag>
        )
      })}
    </div>
  )
}

function TypingIndicator({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <span className="flex items-center gap-2 py-0.5" role="status">
      <span className="flex items-center gap-1" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="size-1.5 rounded-full bg-primary"
            animate={reduceMotion ? { opacity: [0.4, 1, 0.4] } : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">FIZA is typing...</span>
    </span>
  )
}
