/**
 * 交易 CRUD API - 單筆操作
 * GET /api/trades/[id] - 取得單筆交易
 * PUT /api/trades/[id] - 更新交易
 * DELETE /api/trades/[id] - 刪除交易
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
  tradeApiSchema,
  determineWinLoss,
} from '@/lib/validations/trade'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET - 取得單筆交易
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // 驗證使用者
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 查詢交易
    const trade = await prisma.trade.findUnique({
      where: {
        id,
        userId: user.id, // 確保只能存取自己的資料
      },
      include: {
        commodity: true,
        timeframe: true,
        trendlineType: true,
        tradeType: true,
        tradeEntryTypes: {
          include: {
            entryType: true,
          },
        },
      },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, trade })
  } catch (error) {
    console.error('Get Trade Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get trade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// PUT - 更新交易
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // 驗證使用者
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 檢查交易是否存在且屬於當前使用者
    const existingTrade = await prisma.trade.findUnique({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingTrade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // 解析並驗證請求
    const body = await request.json()
    const validatedData = tradeApiSchema.parse(body)

    // 計算衍生欄位
    const winLoss = determineWinLoss(validatedData.actualExitR)

    // 更新交易紀錄
    const trade = await prisma.trade.update({
      where: { id },
      data: {
        tradeDate: validatedData.tradeDate,
        orderDate: validatedData.orderDate,
        tradeTypeId: validatedData.tradeTypeId,
        commodityId: validatedData.commodityId,
        timeframeId: validatedData.timeframeId,
        trendlineTypeId: validatedData.trendlineTypeId || null,
        position: validatedData.position,
        stopLossTicks: validatedData.stopLossTicks,
        targetR: validatedData.targetR,
        actualExitR: validatedData.actualExitR,
        leverage: validatedData.leverage,
        profitLoss: validatedData.profitLoss,
        winLoss,
        notes: validatedData.notes || null,
        screenshotUrls: validatedData.screenshots || [],

        // 更新多對多關聯（先刪除舊的，再建立新的）
        tradeEntryTypes: {
          deleteMany: {},
          create: validatedData.entryTypeIds.map((entryTypeId: string) => ({
            entryTypeId,
          })),
        },
      },
      include: {
        commodity: true,
        timeframe: true,
        trendlineType: true,
        tradeType: true,
        tradeEntryTypes: {
          include: {
            entryType: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      trade,
    })
  } catch (error) {
    console.error('Update Trade Error:', error)

    // Zod 驗證錯誤
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to update trade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE - 刪除交易
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // 驗證使用者
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 檢查交易是否存在且屬於當前使用者
    const existingTrade = await prisma.trade.findUnique({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingTrade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // 刪除交易（Prisma 會自動刪除相關的 tradeEntryTypes）
    await prisma.trade.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Trade deleted successfully',
    })
  } catch (error) {
    console.error('Delete Trade Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete trade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
