import { Briefcase, Calendar, MapPin } from 'lucide-react'
import { experience } from '@/lib/site-config'
import { Reveal } from '@/components/reveal'
import { SectionHeading } from '@/components/section-heading'

export function Experience() {
  return (
    <section id="experience" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading index="03" eyebrow="Experience" title="Where I work." />

        <ol className="relative border-l border-border pl-8 md:pl-12">
          {experience.map((job) => (
            <Reveal as="li" key={job.company} className="relative">
              <span className="animate-pulse-dot absolute top-2 -left-[calc(2rem+6px)] size-3 rounded-full bg-leaf ring-4 ring-background md:-left-[calc(3rem+6px)]" />
              <article className="rounded-3xl border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-xl md:p-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold md:text-3xl">{job.company}</h3>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {job.roles.map((role) => (
                        <li key={role} className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-ink-foreground">
                          {role}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-3.5 py-1.5 text-sm font-medium text-leaf">
                    <span className="size-1.5 rounded-full bg-leaf" />
                    Current
                  </span>
                </div>

                <dl className="mt-8 grid gap-4 border-t border-border pt-6 text-sm sm:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-4 text-primary" aria-hidden="true" />
                    <div>
                      <dt className="text-muted-foreground">Duration</dt>
                      <dd className="font-medium">
                        {job.start} — {job.end}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="size-4 text-primary" aria-hidden="true" />
                    <div>
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="font-medium">{job.location}</dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="size-4 text-primary" aria-hidden="true" />
                    <div>
                      <dt className="text-muted-foreground">Employment</dt>
                      <dd className="font-medium">{job.type}</dd>
                    </div>
                  </div>
                </dl>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
