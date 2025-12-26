import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { verifyAuthentication, type StoredCredential } from '@/lib/webauthn-server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, credential } = await request.json()

    if (!email || !credential) {
      return NextResponse.json(
        { error: 'Email and credential are required' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // Find user by email
    const { data: userData } = await adminSupabase.auth.admin.listUsers()
    const user = userData?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get stored challenge
    const { data: challengeData, error: challengeError } = await adminSupabase
      .from('webauthn_challenges')
      .select('challenge')
      .eq('email', email.toLowerCase())
      .eq('type', 'authentication')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (challengeError || !challengeData) {
      return NextResponse.json(
        { error: 'No pending authentication challenge found' },
        { status: 400 }
      )
    }

    // Get stored credential
    const { data: storedCred, error: credError } = await adminSupabase
      .from('webauthn_credentials')
      .select('credential_id, public_key, counter, transports')
      .eq('user_id', user.id)
      .eq('credential_id', credential.id)
      .single()

    if (credError || !storedCred) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      )
    }

    const storedCredential: StoredCredential = {
      id: storedCred.credential_id,
      credentialId: storedCred.credential_id,
      publicKey: storedCred.public_key,
      counter: storedCred.counter,
      transports: storedCred.transports,
    }

    // Verify authentication
    const verification = await verifyAuthentication(
      credential,
      challengeData.challenge,
      storedCredential
    )

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Authentication verification failed' },
        { status: 400 }
      )
    }

    // Update counter
    await adminSupabase
      .from('webauthn_credentials')
      .update({
        counter: verification.authenticationInfo.newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq('credential_id', credential.id)

    // Clean up challenge
    await adminSupabase
      .from('webauthn_challenges')
      .delete()
      .eq('email', email.toLowerCase())
      .eq('type', 'authentication')

    // Create a session for the user using magic link token approach
    // Generate a one-time login link
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
    })

    if (linkError || !linkData) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Extract token from link and exchange for session
    const token = linkData.properties.hashed_token

    // Use server client to exchange token for session
    const supabase = await createClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'magiclink',
    })

    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('WebAuthn login verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify authentication' },
      { status: 500 }
    )
  }
}
