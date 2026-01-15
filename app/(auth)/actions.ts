'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')

  // Return session for client to store (needed for native app persistence)
  return {
    success: true,
    session: data.session ? {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    } : null
  }
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Failed to create user account' }
  }

  // Profile is created automatically by database trigger (handle_new_user)
  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  // Clear was-verified and guest cookies on logout
  const cookieStore = await cookies()
  cookieStore.set('patchpulse-was-verified', '', {
    path: '/',
    expires: new Date(0),
  })
  cookieStore.set('patchpulse-guest', '', {
    path: '/',
    expires: new Date(0),
  })

  revalidatePath('/', 'layout')
  redirect('/login')
}
