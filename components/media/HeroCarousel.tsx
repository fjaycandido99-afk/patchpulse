'use client'

import { useState, useEffect, useCallback, useRef, TouchEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type HeroCarouselProps = {
  children: React.ReactNode[]
  autoPlayInterval?: number
  showArrows?: boolean
  showDots?: boolean
}

export function HeroCarousel({
  children,
  autoPlayInterval = 6000,
  showArrows = true,
  showDots = true,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const itemCount = children.length

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % itemCount)
  }, [itemCount])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount)
  }, [itemCount])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Auto-play
  useEffect(() => {
    if (isPaused || itemCount <= 1) return

    const interval = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(interval)
  }, [isPaused, autoPlayInterval, goToNext, itemCount])

  // Touch handlers for swipe
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsPaused(true)
  }

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }

    // Resume auto-play after a delay
    setTimeout(() => setIsPaused(false), 3000)
  }

  // Mouse handlers for desktop hover pause
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  if (itemCount === 0) return null

  // Single item - no carousel needed
  if (itemCount === 1) {
    return <div>{children[0]}</div>
  }

  const arrowButtonClass = "absolute top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 touch-feedback"

  return (
    <div
      ref={containerRef}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slides container */}
      <div
        className="relative overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0"
              aria-hidden={index !== currentIndex}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows - hidden on mobile, visible on desktop hover */}
      {showArrows && (
        <>
          <button
            onClick={goToPrev}
            className={`${arrowButtonClass} left-3`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToNext}
            className={`${arrowButtonClass} right-3`}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Pagination dots */}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`carousel-dot touch-feedback ${index === currentIndex ? 'carousel-dot-active' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* Progress bar (optional - shows auto-play progress) */}
      {!isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden rounded-b-2xl">
          <div className="h-full bg-primary/60 animate-carousel-progress" />
        </div>
      )}
    </div>
  )
}
