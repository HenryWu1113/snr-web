/**
 * 交易 CRUD API
 * POST /api/trades - 新增交易
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
  tradeApiSchema,
  determineWinLoss,
} from '@/lib/validations/trade'
import { determineTradingSession } from '@/lib/trading-session'

export async function POST(request: NextRequest) {
  try {
    // 驗證使用者
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 解析並驗證請求
    const body = await request.json()
    const validatedData = tradeApiSchema.parse(body)

    // 計算衍生欄位
    const winLoss = determineWinLoss(validatedData.actualExitR)
    const tradingSession = determineTradingSession(validatedData.tradeDate)

    // 建立交易紀錄
    const trade = await prisma.trade.create({
      data: {
        userId: user.id,
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

        // 新增欄位
        tradingSession,
        holdingTimeMinutes: validatedData.holdingTimeMinutes || null,

        // 建立多對多關聯 - 進場類型
        tradeEntryTypes: {
          create: validatedData.entryTypeIds.map((entryTypeId: string) => ({
            entryTypeId,
          })),
        },

        // 建立多對多關聯 - 自定義標籤
        tradeTags: {
          create: (validatedData.tagIds || []).map((tagId: string) => ({
            tagId,
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
        tradeTags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      trade,
    })
  } catch (error) {
    console.error('Create Trade Error:', error)

    // Zod 驗證錯誤
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create trade',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
