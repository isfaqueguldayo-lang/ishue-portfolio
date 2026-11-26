import { Reveal } from '@/components/reveal'

type SectionHeadingProps = { index: string; eyebrow: string; title: string; onDark?: boolean }

export function SectionHeading({ index, eyebrow, title, onDark = false }: SectionHeadingProps) {
  return (
    <Reveal className="mb-12 md:mb-16">
      <p
        className={`flex items-center gap-3 text-sm font-medium tracking-wide uppercase ${onDark ? 'text-accent' : 'text-primary'}`}
      >
        <span className="font-heading">{index}</span>
        <span className={`h-px w-10 ${onDark ? 'bg-accent/50' : 'bg-primary/50'}`} />
        {eyebrow}
      </p>
      <h2 className="mt-4 max-w-2xl text-3xl font-semibold sm:text-4xl md:text-5xl">{title}</h2>
    </Reveal>
  )
}
