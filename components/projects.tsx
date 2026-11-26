import { ArrowUpRight, Check } from 'lucide-react'
import { links, projects } from '@/lib/site-config'
import { Reveal } from '@/components/reveal'
import { SectionHeading } from '@/components/section-heading'
import { ProjectVisual } from '@/components/project-visual'

export function Projects() {
  return (
    <section id="projects" className="bg-secondary/60 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading index="04" eyebrow="Projects" title="Things I have built." />

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal as="li" key={project.slug} delay={i * 120}>
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-ink/10">
                <ProjectVisual slug={project.slug} />
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <p className="text-xs font-medium tracking-wider text-primary uppercase">{project.category}</p>
                  <h3 className="mt-2 text-xl font-semibold md:text-2xl">{project.title}</h3>
                  <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{project.summary}</p>
                  <ul className="mt-5 flex flex-col gap-2">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2.5 text-sm">
                        <span className="flex size-5 items-center justify-center rounded-full bg-leaf/15 text-leaf">
                          <Check className="size-3" aria-hidden="true" />
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={project.href ?? links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto inline-flex items-center gap-1.5 pt-7 text-sm font-medium text-foreground transition-colors hover:text-primary"
                  >
                    View on GitHub
                    <span className="sr-only">: {project.title}</span>
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
