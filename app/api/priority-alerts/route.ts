import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/subscriptions/limits'

export type RuleType =
  | 'major_patch'
  | 'balance_changes'
  | 'resurfacing'
  | 'new_content'
  | 'high_priority'
  | 'custom'

export type AppliesTo = 'all_games' | 'followed_games' | 'specific_games'

export type PriorityAlertRule = {
  id: string
  user_id: string
  name: string
  description: string | null
  enabled: boolean
  rule_type: RuleType
  applies_to: AppliesTo
  game_ids: string[] | null
  thresholds: Record<string, number>
  conditions: { field: string; operator: string; value: unknown }[] | null
  priority_boost: number
  force_push: boolean
  created_at: string
  updated_at: string
}

// GET - Fetch user's priority alert rules
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Pro access
    const plan = await getUserPlan(user.id)
    if (plan !== 'pro') {
      return NextResponse.json(
        { error: 'Pro subscription required', upgrade: true },
        { status: 403 }
      )
    }

    const { data: rules, error } = await supabase
      .from('priority_alert_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching rules:', error)
      return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 })
    }

    return NextResponse.json({ rules: rules || [] })
  } catch (error) {
    console.error('Priority alerts error:', error)
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 })
  }
}

// POST - Create a new priority alert rule
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Pro access
    const plan = await getUserPlan(user.id)
    if (plan !== 'pro') {
      return NextResponse.json(
        { error: 'Pro subscription required', upgrade: true },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.rule_type) {
      return NextResponse.json(
        { error: 'Name and rule_type are required' },
        { status: 400 }
      )
    }

    // Limit rules per user (max 10)
    const { count } = await supabase
      .from('priority_alert_rules')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (count && count >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 rules allowed' },
        { status: 400 }
      )
    }

    const { data: rule, error } = await supabase
      .from('priority_alert_rules')
      .insert({
        user_id: user.id,
        name: body.name,
        description: body.description || null,
        enabled: body.enabled ?? true,
        rule_type: body.rule_type,
        applies_to: body.applies_to || 'followed_games',
        game_ids: body.game_ids || null,
        thresholds: body.thresholds || {},
        conditions: body.conditions || null,
        priority_boost: body.priority_boost || 0,
        force_push: body.force_push || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating rule:', error)
      return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
    }

    return NextResponse.json({ rule })
  } catch (error) {
    console.error('Priority alerts error:', error)
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
  }
}

// PUT - Update an existing rule
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    // Only update allowed fields
    const updates: Partial<PriorityAlertRule> = {}
    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.enabled !== undefined) updates.enabled = body.enabled
    if (body.rule_type !== undefined) updates.rule_type = body.rule_type
    if (body.applies_to !== undefined) updates.applies_to = body.applies_to
    if (body.game_ids !== undefined) updates.game_ids = body.game_ids
    if (body.thresholds !== undefined) updates.thresholds = body.thresholds
    if (body.conditions !== undefined) updates.conditions = body.conditions
    if (body.priority_boost !== undefined) updates.priority_boost = body.priority_boost
    if (body.force_push !== undefined) updates.force_push = body.force_push

    const { data: rule, error } = await supabase
      .from('priority_alert_rules')
      .update(updates)
      .eq('id', body.id)
      .eq('user_id', user.id) // Ensure user owns the rule
      .select()
      .single()

    if (error) {
      console.error('Error updating rule:', error)
      return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 })
    }

    return NextResponse.json({ rule })
  } catch (error) {
    console.error('Priority alerts error:', error)
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 })
  }
}

// DELETE - Delete a rule
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('id')

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('priority_alert_rules')
      .delete()
      .eq('id', ruleId)
      .eq('user_id', user.id) // Ensure user owns the rule

    if (error) {
      console.error('Error deleting rule:', error)
      return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Priority alerts error:', error)
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
  }
}
