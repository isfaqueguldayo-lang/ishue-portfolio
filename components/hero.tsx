import Image from 'next/image'
import { ArrowDownRight, Mail, MapPin } from 'lucide-react'
import { links, profile } from '@/lib/site-config'
import { GithubIcon, LinkedinIcon } from '@/components/brand-icons'
import { RoleRotator } from '@/components/role-rotator'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 md:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground">
            <span className="animate-pulse-dot size-2 rounded-full bg-leaf" />
            Currently at Xloop Digital
          </p>

          <h1 className="animate-rise mt-6 text-5xl leading-[1.05] font-semibold sm:text-6xl lg:text-7xl [animation-delay:120ms]">
            {"Hi, I'm"} <span className="text-primary">{profile.firstName}</span>
            <br />
            Gul.
          </h1>

          <p className="animate-rise mt-5 h-9 font-heading text-xl font-medium text-foreground/80 sm:text-2xl [animation-delay:240ms]">
            <RoleRotator roles={profile.roles} />
          </p>

          <p className="animate-rise mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg [animation-delay:360ms]">
            {profile.bio}
          </p>

          <div className="animate-rise mt-9 flex flex-wrap items-center gap-3 [animation-delay:480ms]">
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-ink-foreground transition-all hover:-translate-y-0.5 hover:bg-primary hover:shadow-lg hover:shadow-primary/25"
            >
              View projects
              <ArrowDownRight className="size-4 transition-transform group-hover:rotate-[-45deg]" />
            </a>
            <a
              href={`mailto:${links.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card px-6 py-3.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              <Mail className="size-4" />
              Email me
            </a>
            <div className="flex items-center gap-2 sm:ml-2">
              <a
                href={links.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub profile"
                className="flex size-11 items-center justify-center rounded-full border border-foreground/15 transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                <GithubIcon className="size-[18px]" />
              </a>
              <a
                href={links.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn profile"
                className="flex size-11 items-center justify-center rounded-full border border-foreground/15 transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                <LinkedinIcon className="size-[17px]" />
              </a>
            </div>
          </div>
        </div>

        <div className="animate-rise relative mx-auto w-full max-w-[420px] [animation-delay:200ms]">
          <div className="relative aspect-square">
            <div
              aria-hidden="true"
              className="animate-spin-slow absolute -inset-4 rounded-full border border-dashed border-primary/50"
            />
            <div aria-hidden="true" className="absolute -inset-4 animate-spin-slow [animation-direction:reverse] [animation-duration:18s]">
              <span className="absolute top-1/2 -left-1.5 size-3 rounded-full bg-leaf" />
              <span className="absolute -top-1 left-1/2 size-2 rounded-full bg-primary" />
            </div>
            <div className="relative size-full overflow-hidden rounded-full bg-ink shadow-2xl shadow-ink/30 ring-8 ring-card">
              <Image
                src={profile.photo || '/placeholder.svg'}
                alt={`Portrait of ${profile.name}`}
                fill
                priority
                sizes="(min-width: 1024px) 420px, 80vw"
                className="scale-[1.08] object-cover object-center"
              />
            </div>

            <div className="animate-float absolute -bottom-2 -left-2 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-xl backdrop-blur sm:-left-8">
              <p className="text-xs text-muted-foreground">Based in</p>
              <p className="flex items-center gap-1.5 font-heading text-sm font-semibold">
                <MapPin className="size-3.5 text-primary" />
                {profile.location}
              </p>
            </div>
            <div className="animate-float absolute top-6 -right-2 rounded-2xl bg-ink px-4 py-3 text-ink-foreground shadow-xl [animation-delay:1.5s] sm:-right-6">
              <p className="font-heading text-sm leading-tight font-medium">
                Better Code,
                <br />
                <span className="text-accent">Bigger Dreams</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
