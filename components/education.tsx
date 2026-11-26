import { GraduationCap } from 'lucide-react'
import { education } from '@/lib/site-config'
import { Reveal } from '@/components/reveal'
import { SectionHeading } from '@/components/section-heading'
import { cn } from '@/lib/utils'

export function Education() {
  return (
    <section id="education" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading index="05" eyebrow="Education" title="Learning, always." />

        <ul className="grid gap-5 md:grid-cols-2">
          {education.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 120}>
              <article
                className={cn(
                  'group flex h-full items-start gap-5 rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1 md:p-8',
                  item.current ? 'border-primary/30 bg-card shadow-lg shadow-primary/5' : 'border-border bg-card/60',
                )}
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-ink-foreground transition-transform duration-500 group-hover:rotate-6">
                  <GraduationCap className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className={cn('mt-2 text-sm font-medium', item.current ? 'text-primary' : 'text-muted-foreground')}>
                    {item.status}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
