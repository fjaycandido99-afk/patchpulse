'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = await createClient()

  // Get the site URL for email redirect
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Failed to create user account' }
  }

  // Check if email confirmation is required
  // If identities array is empty, email confirmation is needed
  const needsEmailConfirmation = data.user.identities?.length === 0 ||
    data.user.email_confirmed_at === null

  if (needsEmailConfirmation) {
    // Return success with email confirmation required flag
    return {
      success: true,
      emailConfirmationRequired: true,
      email: email
    }
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

  revalidatePath('/', 'layout')
  redirect('/login')
}
