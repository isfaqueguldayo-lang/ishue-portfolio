'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navItems, profile } from '@/lib/site-config'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrolled(window.scrollY > 12)
      setProgress(max > 0 ? window.scrollY / max : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const sections = navItems
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((el): el is HTMLElement => Boolean(el))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => observer.observe(s))

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'bg-background/80 shadow-[0_1px_0_var(--border)] backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="group flex items-center gap-2.5 font-heading font-semibold">
          <span className="flex size-9 items-center justify-center rounded-full bg-ink text-sm text-ink-foreground transition-transform duration-500 group-hover:rotate-[360deg]">
            IG
          </span>
          <span className="hidden sm:inline">{profile.name}</span>
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    'relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                    active === item.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      'absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left rounded-full bg-primary transition-transform duration-300',
                      active === item.href ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="#contact"
          className="hidden rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ink-foreground transition-all hover:-translate-y-0.5 hover:bg-primary md:inline-flex"
        >
          {"Let's talk"}
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex size-10 items-center justify-center rounded-full border border-border md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          'grid overflow-hidden bg-background/95 backdrop-blur-md transition-[grid-template-rows] duration-500 md:hidden',
          open ? 'grid-rows-[1fr] border-b border-border' : 'grid-rows-[0fr]',
        )}
      >
        <nav aria-label="Mobile" className="min-h-0">
          <ul className="flex flex-col gap-1 px-5 py-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  className="block rounded-lg px-3 py-3 font-heading text-lg font-medium hover:bg-secondary"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-0.5 origin-left bg-primary"
        style={{ width: '100%', transform: `scaleX(${progress})` }}
      />
    </header>
  )
}
