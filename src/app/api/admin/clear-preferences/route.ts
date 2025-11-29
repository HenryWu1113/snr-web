/**
 * 臨時 API：清除 DataTable 相關的使用者偏好設定
 * 用於修復 schema 變更後的欄位名稱不匹配問題
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // 驗證使用者（可選，如果只是開發環境可以註解掉）
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 查詢現有的 datatable 相關偏好設定
    const preferences = await prisma.userPreference.findMany({
      where: {
        OR: [
          { type: { contains: 'datatable' } },
          { type: { contains: 'trade' } },
          { type: { contains: 'column' } },
          { type: { contains: 'sort' } },
        ],
      },
    })

    console.log(`找到 ${preferences.length} 筆偏好設定`)

    // 刪除這些偏好設定
    const result = await prisma.userPreference.deleteMany({
      where: {
        OR: [
          { type: { contains: 'datatable' } },
          { type: { contains: 'trade' } },
          { type: { contains: 'column' } },
          { type: { contains: 'sort' } },
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: `成功刪除 ${result.count} 筆偏好設定`,
      deletedPreferences: preferences.map((p) => ({
        type: p.type,
        userId: p.userId,
      })),
    })
  } catch (error) {
    console.error('Clear Preferences Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to clear preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET 方法：僅查詢，不刪除
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await prisma.userPreference.findMany({
      where: {
        OR: [
          { type: { contains: 'datatable' } },
          { type: { contains: 'trade' } },
          { type: { contains: 'column' } },
          { type: { contains: 'sort' } },
        ],
      },
    })

    return NextResponse.json({
      count: preferences.length,
      preferences: preferences.map((p) => ({
        id: p.id,
        type: p.type,
        userId: p.userId,
        settings: p.settings,
      })),
    })
  } catch (error) {
    console.error('Get Preferences Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
