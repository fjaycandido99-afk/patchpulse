import { ReactNode, CSSProperties } from 'react'

type CardVariant = 'default' | 'subtle'

type CardProps = {
  children: ReactNode
  variant?: CardVariant
  clickable?: boolean
  className?: string
  style?: CSSProperties
}

const variantStyles: Record<CardVariant, string> = {
  default: 'border-border bg-card',
  subtle: 'border-transparent bg-card/50',
}

export function Card({
  children,
  variant = 'default',
  clickable = false,
  className = '',
  style,
}: CardProps) {
  const baseStyles = 'rounded-lg border p-4 transition-colors'
  const clickableStyles = clickable
    ? 'cursor-pointer hover:border-primary/50 hover:bg-card/80'
    : ''

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${clickableStyles} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

type CardHeaderProps = {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      {children}
    </div>
  )
}

type CardTitleProps = {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3
      className={`font-semibold leading-tight tracking-tight group-hover:text-primary ${className}`}
    >
      {children}
    </h3>
  )
}

type CardContentProps = {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`mt-3 space-y-3 ${className}`}>{children}</div>
}

type CardDescriptionProps = {
  children: ReactNode
  lines?: 1 | 2 | 3
  className?: string
}

export function CardDescription({
  children,
  lines = 2,
  className = '',
}: CardDescriptionProps) {
  const lineClamp = {
    1: 'line-clamp-1',
    2: 'line-clamp-2',
    3: 'line-clamp-3',
  }

  return (
    <p
      className={`text-sm text-muted-foreground ${lineClamp[lines]} ${className}`}
    >
      {children}
    </p>
  )
}
