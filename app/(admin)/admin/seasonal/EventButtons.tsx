'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { approveEvent, rejectEvent } from './actions'

export function ApproveButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    setLoading(true)
    const result = await approveEvent(eventId)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to approve')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 transition-colors"
      title="Approve"
    >
      <Check className="w-4 h-4" />
    </button>
  )
}

export function RejectButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleReject() {
    if (!confirm('Are you sure you want to reject this event?')) return

    setLoading(true)
    const result = await rejectEvent(eventId)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to reject')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleReject}
      disabled={loading}
      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-colors"
      title="Reject"
    >
      <X className="w-4 h-4" />
    </button>
  )
}
