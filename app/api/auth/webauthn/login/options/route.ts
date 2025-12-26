import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticationOptions, type StoredCredential } from '@/lib/webauthn-server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Find user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to lookup user' },
        { status: 500 }
      )
    }

    const user = userData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      return NextResponse.json(
        { error: 'No biometric credential found' },
        { status: 404 }
      )
    }

    // Get credentials for this user
    const { data: credentials, error: credError } = await supabase
      .from('webauthn_credentials')
      .select('credential_id, public_key, counter, transports')
      .eq('user_id', user.id)

    if (credError || !credentials || credentials.length === 0) {
      return NextResponse.json(
        { error: 'No biometric credential found' },
        { status: 404 }
      )
    }

    const storedCredentials: StoredCredential[] = credentials.map((c) => ({
      id: c.credential_id,
      credentialId: c.credential_id,
      publicKey: c.public_key,
      counter: c.counter,
      transports: c.transports,
    }))

    // Generate authentication options
    const options = await getAuthenticationOptions(storedCredentials)

    // Store challenge in database
    await supabase.from('webauthn_challenges').insert({
      email: email.toLowerCase(),
      challenge: options.challenge,
      type: 'authentication',
    })

    return NextResponse.json(options)
  } catch (error: any) {
    console.error('WebAuthn login options error:', error)
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 }
    )
  }
}
