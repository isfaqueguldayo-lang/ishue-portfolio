'use client'

import { useEffect, useState } from 'react'

export function RoleRotator({ roles }: { roles: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % roles.length), 2600)
    return () => window.clearInterval(id)
  }, [roles.length])

  return (
    <span className="inline-flex items-baseline gap-2 overflow-hidden" aria-live="polite">
      <span className="text-muted-foreground">I work as a</span>
      <span key={index} className="animate-word-in inline-block border-b-2 border-accent text-foreground">
        {roles[index]}
      </span>
    </span>
  )
}
