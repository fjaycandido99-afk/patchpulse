import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Download PatchPulse',
  description: 'Download PatchPulse to track game patches, manage your backlog, and never miss an update.',
  openGraph: {
    title: 'Download PatchPulse',
    description: 'Track game patches. Play smarter.',
    siteName: 'PatchPulse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Download PatchPulse',
    description: 'Track game patches. Play smarter.',
  },
}

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
