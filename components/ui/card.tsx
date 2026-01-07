import { ReactNode, CSSProperties } from 'react'

type CardVariant = 'default' | 'subtle' | 'glass' | 'gradient'

type CardProps = {
  children: ReactNode
  variant?: CardVariant
  clickable?: boolean
  glow?: boolean
  className?: string
  style?: CSSProperties
}

const variantStyles: Record<CardVariant, string> = {
  default: 'border-white/10 bg-zinc-900/80 backdrop-blur-sm',
  subtle: 'border-white/5 bg-zinc-900/50 backdrop-blur-sm',
  glass: 'border-white/10 bg-white/5 backdrop-blur-md',
  gradient: 'border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-800/50 to-zinc-900/90 backdrop-blur-sm',
}

export function Card({
  children,
  variant = 'default',
  clickable = false,
  glow = false,
  className = '',
  style,
}: CardProps) {
  const baseStyles = 'rounded-xl border p-4 transition-all duration-300'
  const clickableStyles = clickable
    ? 'cursor-pointer hover:border-primary/40 hover:bg-white/[0.08] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]'
    : ''
  const glowStyles = glow
    ? 'shadow-lg shadow-primary/10 border-primary/20'
    : ''

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${clickableStyles} ${glowStyles} ${className}`}
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
      className={`font-semibold leading-tight tracking-tight text-white group-hover:text-primary transition-colors ${className}`}
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
      className={`text-sm text-zinc-400 leading-relaxed ${lineClamp[lines]} ${className}`}
    >
      {children}
    </p>
  )
}

type CardFooterProps = {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-3 border-t border-white/5 flex items-center justify-between ${className}`}>
      {children}
    </div>
  )
}
