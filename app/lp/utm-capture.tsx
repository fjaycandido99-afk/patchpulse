'use client'

import { useEffect } from 'react'
import { captureUTMParams } from '@/lib/utm'

export function UTMCapture() {
  useEffect(() => {
    // Capture UTM params on page load
    captureUTMParams()
  }, [])

  return null
}
