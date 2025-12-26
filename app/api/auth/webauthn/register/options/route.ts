import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRegistrationOptions, getDeviceName, type StoredCredential } from '@/lib/webauthn-server'
import { headers } from 'next/headers'

export async function POST() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get existing credentials for this user
    const { data: existingCredentials } = await supabase
      .from('webauthn_credentials')
      .select('credential_id, public_key, counter, transports')
      .eq('user_id', user.id)

    const credentials: StoredCredential[] = (existingCredentials || []).map((c) => ({
      id: c.credential_id,
      credentialId: c.credential_id,
      publicKey: c.public_key,
      counter: c.counter,
      transports: c.transports,
    }))

    // Generate registration options
    const options = await getRegistrationOptions(
      user.id,
      user.email || '',
      credentials
    )

    // Store challenge in database
    await supabase.from('webauthn_challenges').insert({
      user_id: user.id,
      challenge: options.challenge,
      type: 'registration',
    })

    return NextResponse.json(options)
  } catch (error: any) {
    console.error('WebAuthn registration options error:', error)
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    )
  }
}
