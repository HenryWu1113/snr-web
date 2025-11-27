/**
 * 使用者設定 API
 * GET /api/preferences?type=datatable_columns
 * POST /api/preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET - 取得使用者設定
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')

    if (!type) {
      return NextResponse.json({ error: 'Type parameter is required' }, { status: 400 })
    }

    const preference = await prisma.userPreference.findUnique({
      where: {
        userId_type: {
          userId: user.id,
          type,
        },
      },
    })

    return NextResponse.json({
      settings: preference?.settings || null,
    })
  } catch (error) {
    console.error('Get Preferences Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - 儲存使用者設定
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, settings } = body

    if (!type || !settings) {
      return NextResponse.json(
        { error: 'Type and settings are required' },
        { status: 400 }
      )
    }

    const preference = await prisma.userPreference.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type,
        },
      },
      update: {
        settings,
      },
      create: {
        userId: user.id,
        type,
        settings,
      },
    })

    return NextResponse.json({ success: true, preference })
  } catch (error) {
    console.error('Save Preferences Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
