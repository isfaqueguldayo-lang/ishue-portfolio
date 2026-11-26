import { BookOpen, CalendarCheck, GraduationCap, QrCode, Stethoscope, UserCheck } from 'lucide-react'
import type { Project } from '@/lib/site-config'

export function ProjectVisual({ slug }: { slug: Project['slug'] }) {
  return (
    <div aria-hidden="true" className="relative flex h-48 items-center justify-center overflow-hidden bg-ink">
      <div className="grain absolute inset-0 opacity-40 invert" />
      {slug === 'lms' && <LmsVisual />}
      {slug === 'attendance' && <AttendanceVisual />}
      {slug === 'appointment' && <AppointmentVisual />}
    </div>
  )
}

function LmsVisual() {
  return (
    <div className="relative flex items-end gap-3 transition-transform duration-500 group-hover:scale-105">
      {[60, 88, 72].map((h, i) => (
        <div
          key={i}
          className="w-12 rounded-t-lg bg-ink-foreground/10 transition-all duration-700 group-hover:bg-accent/30"
          style={{ height: h, transitionDelay: `${i * 80}ms` }}
        />
      ))}
      <div className="animate-float absolute -top-10 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-2xl bg-accent text-ink shadow-lg">
        <GraduationCap className="size-7" />
      </div>
      <BookOpen className="absolute -right-10 bottom-0 size-6 text-ink-foreground/40" />
    </div>
  )
}

function AttendanceVisual() {
  return (
    <div className="relative flex items-center gap-6 transition-transform duration-500 group-hover:scale-105">
      <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-accent/60 bg-ink-foreground/5">
        <QrCode className="size-14 text-ink-foreground/80" />
        <span className="animate-scan absolute inset-x-2 top-3 h-0.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
      </div>
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-leaf text-ink-foreground">
              <UserCheck className="size-3" />
            </span>
            <span className="h-2 rounded-full bg-ink-foreground/15" style={{ width: 56 - i * 10 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function AppointmentVisual() {
  return (
    <div className="relative transition-transform duration-500 group-hover:scale-105">
      <div className="grid grid-cols-5 gap-1.5 rounded-2xl bg-ink-foreground/5 p-3">
        {Array.from({ length: 15 }).map((_, i) => (
          <span
            key={i}
            className={`size-6 rounded-md ${i === 7 ? 'bg-accent' : i === 3 || i === 11 ? 'bg-leaf/70' : 'bg-ink-foreground/10'}`}
          />
        ))}
      </div>
      <div className="animate-float absolute -top-6 -right-8 flex size-12 items-center justify-center rounded-full bg-accent text-ink shadow-lg">
        <Stethoscope className="size-6" />
      </div>
      <CalendarCheck className="absolute -bottom-2 -left-8 size-6 text-ink-foreground/40" />
    </div>
  )
}
