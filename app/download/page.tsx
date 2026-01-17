'use client'

import { useEffect } from 'react'

const APP_STORE_URL = 'https://apps.apple.com/app/patchpulse/id6757092034'
const LANDING_PAGE = '/lp'

export default function DownloadPage() {
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()

    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)
    const isMac = /macintosh|mac os x/.test(userAgent) && !isIOS

    if (isIOS || isMac || isAndroid) {
      window.location.href = APP_STORE_URL
    } else {
      window.location.href = LANDING_PAGE
    }
  }, [])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <img
        src="/logo.png"
        alt="PatchPulse"
        className="w-24 h-24 mb-4"
      />
      <h1 className="text-2xl font-bold text-white mb-2">PatchPulse</h1>
      <p className="text-zinc-400">Redirecting to download...</p>
    </div>
  )
}
