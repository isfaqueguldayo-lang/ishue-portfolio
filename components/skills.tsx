import { skillGroups } from '@/lib/site-config'
import { Reveal } from '@/components/reveal'
import { SectionHeading } from '@/components/section-heading'

export function Skills() {
  const allSkills = skillGroups.flatMap((g) => g.items)

  return (
    <section id="skills" className="bg-ink py-20 text-ink-foreground md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading index="02" eyebrow="Skills" title="The tools I work with." onDark />

        <div className="grid gap-px overflow-hidden rounded-3xl border border-ink-foreground/10 bg-ink-foreground/10 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, i) => (
            <Reveal key={group.label} delay={i * 80} className="bg-ink">
              <div className="group h-full p-7 transition-colors duration-300 hover:bg-ink-foreground/[0.04]">
                <p className="font-heading text-sm text-accent">0{i + 1}</p>
                <h3 className="mt-2 text-xl font-semibold">{group.label}</h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full border border-ink-foreground/15 px-3.5 py-1.5 text-sm text-ink-foreground/85 transition-all duration-300 group-hover:border-accent/50 hover:bg-accent hover:text-ink"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="relative mt-16 overflow-hidden border-y border-ink-foreground/10 py-6" aria-hidden="true">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
          {[...allSkills, ...allSkills].map((skill, i) => (
            <span key={i} className="flex items-center gap-10 font-heading text-3xl font-semibold text-ink-foreground/25 md:text-4xl">
              {skill}
              <span className="size-2 rounded-full bg-accent" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
