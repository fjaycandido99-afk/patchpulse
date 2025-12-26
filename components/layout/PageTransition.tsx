'use client'

import { ReactNode } from 'react'

type PageTransitionProps = {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div className={`page-enter ${className}`}>
      {children}
    </div>
  )
}
