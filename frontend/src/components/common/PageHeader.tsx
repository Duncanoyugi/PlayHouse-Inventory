import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  children?: ReactNode
}

export function PageHeader({ title, description, eyebrow, actions, children }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        {eyebrow ? <p className="text-xs font-medium uppercase tracking-wide text-muted">{eyebrow}</p> : null}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h1>
          {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
        </div>
        {children}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export default PageHeader
