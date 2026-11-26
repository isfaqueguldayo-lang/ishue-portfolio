import { Cloud, Code2, Database, Workflow } from 'lucide-react'
import { profile } from '@/lib/site-config'
import { Reveal } from '@/components/reveal'
import { SectionHeading } from '@/components/section-heading'

const focusAreas = [
  { icon: Code2, label: 'Modern web technologies' },
  { icon: Database, label: 'Backend & data processing' },
  { icon: Cloud, label: 'Cloud platforms' },
  { icon: Workflow, label: 'Workflow automation' },
]

export function About() {
  return (
    <section id="about" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading index="01" eyebrow="About" title="Building across the full stack — from interface to data." />

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Reveal>
            <p className="text-pretty text-xl leading-relaxed text-foreground/85 md:text-2xl">{profile.bio}</p>
          </Reveal>

          <ul className="grid grid-cols-2 gap-3">
            {focusAreas.map(({ icon: Icon, label }, i) => (
              <Reveal as="li" key={label} delay={i * 90}>
                <div className="group h-full rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-4 font-heading text-sm font-medium leading-snug">{label}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
