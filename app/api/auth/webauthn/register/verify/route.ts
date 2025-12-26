import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyRegistration, encodePublicKey, getDeviceName } from '@/lib/webauthn-server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
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

    // Get registration response from client
    const credential = await request.json()

    // Get stored challenge
    const { data: challengeData, error: challengeError } = await supabase
      .from('webauthn_challenges')
      .select('challenge')
      .eq('user_id', user.id)
      .eq('type', 'registration')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (challengeError || !challengeData) {
      return NextResponse.json(
        { error: 'No pending registration challenge found' },
        { status: 400 }
      )
    }

    // Verify registration
    const verification = await verifyRegistration(credential, challengeData.challenge)

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Registration verification failed' },
        { status: 400 }
      )
    }

    const { credential: cred, credentialDeviceType, credentialBackedUp } = verification.registrationInfo

    // Get device name from user agent
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const deviceName = getDeviceName(userAgent)

    // Store credential in database
    const { error: insertError } = await supabase.from('webauthn_credentials').insert({
      user_id: user.id,
      credential_id: cred.id,
      public_key: encodePublicKey(cred.publicKey),
      counter: cred.counter,
      transports: credential.response.transports || [],
      device_name: deviceName,
    })

    if (insertError) {
      console.error('Failed to store credential:', insertError)
      return NextResponse.json(
        { error: 'Failed to store credential' },
        { status: 500 }
      )
    }

    // Clean up challenge
    await supabase
      .from('webauthn_challenges')
      .delete()
      .eq('user_id', user.id)
      .eq('type', 'registration')

    return NextResponse.json({
      success: true,
      credentialId: cred.id,
      email: user.email,
    })
  } catch (error: any) {
    console.error('WebAuthn registration verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify registration' },
      { status: 500 }
    )
  }
}
