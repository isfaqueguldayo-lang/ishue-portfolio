'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUp, MessageCircle, X } from 'lucide-react'
import { AssistantChat } from '@/components/assistant-chat'

type GuideStop = {
  id: string
  label: string
  message: string
}

const GUIDE_STOPS: GuideStop[] = [
  {
    id: 'top',
    label: 'Intro',
    message: "Hello! Hi! I'm FIZA, Ishfaq Gul Dayo's personal AI guide. Welcome to his portfolio! Tap me to chat.",
  },
  {
    id: 'about',
    label: 'About',
    message: "Here's a little about Ishfaq and how he likes to build things.",
  },
  {
    id: 'skills',
    label: 'Skills',
    message: 'Ooh, the toolbox! Frontend, backend, cloud and data skills live here.',
  },
  {
    id: 'experience',
    label: 'Experience',
    message: 'This is where Ishfaq works right now. Pretty cool, right?',
  },
  {
    id: 'projects',
    label: 'Projects',
    message: 'My favourite part! Smart LMS, QR Attendance and more. Take a peek!',
  },
  {
    id: 'education',
    label: 'Education',
    message: 'A quick look at where all that learning happened.',
  },
  {
    id: 'contact',
    label: 'Contact',
    message: "You made it! Say hi to Ishfaq, he'd love to hear from you.",
  },
]

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}

const SECTION_IDS = GUIDE_STOPS.map((stop) => stop.id)

export function MascotGuide() {
  const reduceMotion = useReducedMotion()
  const activeId = useActiveSection(SECTION_IDS)
  const [isOpen, setIsOpen] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const activeIndex = Math.max(
    0,
    GUIDE_STOPS.findIndex((stop) => stop.id === activeId),
  )
  const current = GUIDE_STOPS[activeIndex]
  const isLast = activeIndex === GUIDE_STOPS.length - 1
  const next = isLast ? GUIDE_STOPS[0] : GUIDE_STOPS[activeIndex + 1]

  function goToNext() {
    document
      .getElementById(next.id)
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  function handleMascotClick() {
    setIsChatOpen((open) => !open)
  }

  const closeChat = useCallback(() => setIsChatOpen(false), [])

  return (
    <motion.aside
      aria-label="Portfolio guide"
      className="fixed right-4 bottom-4 z-50 flex items-end gap-3 md:right-6 md:bottom-6"
      initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.8 }}
    >
      <AnimatePresence mode="wait">
        {isChatOpen ? (
          <AssistantChat key="chat" onClose={closeChat} />
        ) : isOpen && (
          <motion.div
            key={current.id}
            role="status"
            aria-live="polite"
            className="relative mb-6 w-56 rounded-2xl border border-border bg-card px-4 pt-3 pb-3 text-card-foreground shadow-xl shadow-foreground/10 sm:w-64"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, x: 16, scale: 0.85, rotate: 3 }
            }
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, x: 12, scale: 0.9, transition: { duration: 0.15 } }
            }
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            style={{ transformOrigin: 'bottom right' }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-medium tracking-widest text-primary uppercase">
                {current.label}
                <span className="text-muted-foreground">
                  {' '}
                  {'·'} {activeIndex + 1}/{GUIDE_STOPS.length}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="-mt-1 -mr-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label="Hide guide message"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-1 text-sm leading-relaxed text-pretty">
              {current.message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={goToNext}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-ink-foreground transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {isLast ? 'Back to top' : `Next: ${next.label}`}
                {isLast ? (
                  <ArrowUp className="size-3.5" aria-hidden="true" />
                ) : (
                  <ArrowDown className="size-3.5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <MessageCircle className="size-3.5" aria-hidden="true" />
                Ask me
              </button>
            </div>

            <span
              aria-hidden="true"
              className="absolute -right-1.5 bottom-5 size-3 rotate-45 border-t border-r border-border bg-card"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.button
          key={reduceMotion ? 'static' : current.id}
          type="button"
          onClick={handleMascotClick}
          aria-label={isChatOpen ? 'Close chat with FIZA' : 'Chat with FIZA, AI guide'}
          aria-expanded={isChatOpen}
          className="group relative block size-16 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none md:size-20"
          initial={false}
          animate={
            reduceMotion ? undefined : { rotate: [0, -14, 10, -8, 6, -3, 0] }
          }
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: -6 }}
          whileTap={{ scale: 0.92 }}
          style={{ transformOrigin: 'bottom center' }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-primary/25 [animation-duration:2.6s] motion-reduce:hidden"
          />
          <span className="relative block size-full overflow-hidden rounded-full border-4 border-card bg-card shadow-lg shadow-foreground/20">
            <Image
              src="/images/mascot.webp"
              alt=""
              width={160}
              height={160}
              className="size-full object-cover"
              priority={false}
            />
          </span>
          {!isOpen && !isChatOpen && (
            <span
              aria-hidden="true"
              className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
            >
              !
            </span>
          )}
        </motion.button>
      </motion.div>
    </motion.aside>
  )
}
