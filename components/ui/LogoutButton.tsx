'use client'

import { signOut } from '@/app/(auth)/actions'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      Log out
    </button>
  )
}
