'use client'

import { Bell } from 'lucide-react'

// Simplified component - just shows that in-app notifications are active
export function PushNotificationToggle() {
  return (
    <div className="rounded-xl border border-white/10 bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">In-App Notifications</p>
          <p className="text-sm text-muted-foreground">
            You&apos;ll see notifications while using the app
          </p>
        </div>
      </div>
    </div>
  )
}
