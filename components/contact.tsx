import { ArrowUpRight, Mail } from 'lucide-react'
import { links } from '@/lib/site-config'
import { GithubIcon, LinkedinIcon } from '@/components/brand-icons'
import { Reveal } from '@/components/reveal'

const channels = [
  { label: 'Email', value: links.email, href: `mailto:${links.email}`, icon: Mail, external: false },
  { label: 'LinkedIn', value: 'Ishfaq Gul', href: links.linkedin, icon: LinkedinIcon, external: true },
  { label: 'GitHub', value: 'ishfaqueguldayo-lang', href: links.github, icon: GithubIcon, external: true },
]

export function Contact() {
  return (
    <section id="contact" className="px-3 pb-3 md:px-5 md:pb-5">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink py-20 text-ink-foreground md:py-28">
        <div aria-hidden="true" className="animate-spin-slow absolute -top-40 -right-40 size-[28rem] rounded-full border border-dashed border-accent/25" />
        <div aria-hidden="true" className="absolute -bottom-24 -left-24 size-72 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 md:px-8">
          <Reveal>
            <p className="flex items-center gap-3 text-sm font-medium tracking-wide text-accent uppercase">
              <span className="font-heading">06</span>
              <span className="h-px w-10 bg-accent/50" />
              Contact
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl md:text-6xl">
              {"Let's build something "}
              <span className="text-accent">together.</span>
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <a
              href={`mailto:${links.email}`}
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-medium text-ink transition-all hover:-translate-y-0.5 hover:bg-ink-foreground"
            >
              Say hello
              <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
            </a>
          </Reveal>

          <ul className="mt-16 grid gap-4 md:grid-cols-3">
            {channels.map(({ label, value, href, icon: Icon, external }, i) => (
              <Reveal as="li" key={label} delay={200 + i * 100}>
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="group flex items-center gap-4 rounded-2xl border border-ink-foreground/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:bg-ink-foreground/[0.04]"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink-foreground/10 text-accent transition-colors group-hover:bg-accent group-hover:text-ink">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink-foreground/60">{label}</span>
                    <span className="block truncate font-medium">{value}</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-ink-foreground/40 transition-all group-hover:text-accent" aria-hidden="true" />
                </a>
              </Reveal>
            ))}
          </ul>

          <footer className="mt-20 flex flex-col gap-2 border-t border-ink-foreground/10 pt-8 text-sm text-ink-foreground/50 sm:flex-row sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Ishfaq Gul</p>
            <a href="#top" className="transition-colors hover:text-accent">
              Back to top &uarr;
            </a>
          </footer>
        </div>
      </div>
    </section>
  )
}
