/**
 * 交易紀錄匯出 API
 * 匯出所有符合篩選條件的交易紀錄（不分頁）
 *
 * POST /api/trades/export
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
  buildTradeWhereClause,
  buildTradeOrderByClause,
  normalizeDataTableRequest,
} from '@/lib/datatable'
import type {
  TradeDataTableRequest,
  TradeWithRelations,
} from '@/types/datatable'

export async function POST(request: NextRequest) {
  try {
    // 1. 驗證使用者身份
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. 解析請求體
    const body: Partial<TradeDataTableRequest> = await request.json()

    // 3. 規範化請求參數 (主要為了 filters 和 sort)
    const normalizedRequest = normalizeDataTableRequest(body)

    // 4. 建構 Prisma 查詢條件
    const whereClause = buildTradeWhereClause(normalizedRequest.filters, user.id)
    const orderByClause = buildTradeOrderByClause(normalizedRequest.sort)

    // 5. 查詢所有符合條件的資料 (不分頁)
    // 為了效能，可以限制最大筆數，例如 5000
    const trades = await prisma.trade.findMany({
      where: whereClause,
      orderBy: orderByClause,
      take: 5000, // 安全限制
      include: {
        commodity: {
          select: {
            id: true,
            name: true,
          },
        },
        timeframe: {
          select: {
            id: true,
            name: true,
          },
        },
        trendlineType: {
          select: {
            id: true,
            name: true,
          },
        },
        tradeType: {
          select: {
            id: true,
            name: true,
          },
        },
        tradeEntryTypes: {
          include: {
            entryType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tradeTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // 6. 轉換資料格式
    const transformedTrades: TradeWithRelations[] = trades.map((trade) => ({
      id: trade.id,
      userId: trade.userId,
      tradeDate: trade.tradeDate,
      orderDate: trade.orderDate,
      tradeType: trade.tradeType,
      commodity: trade.commodity,
      timeframe: trade.timeframe,
      trendlineType: trade.trendlineType,
      position: trade.position as 'LONG' | 'SHORT',
      entryTypes: trade.tradeEntryTypes.map((tet) => tet.entryType),
      tradingSession: trade.tradingSession as 'ASIAN' | 'LONDON' | 'NEWYORK' | 'OVERLAP' | null,
      holdingTimeMinutes: trade.holdingTimeMinutes,
      tradeTags: trade.tradeTags,
      stopLossTicks: trade.stopLossTicks,
      targetR: Number(trade.targetR),
      actualExitR: Number(trade.actualExitR),
      leverage: Number(trade.leverage),
      profitLoss: Number(trade.profitLoss),
      winLoss: trade.winLoss as 'win' | 'loss' | 'breakeven',
      notes: trade.notes || undefined,
      screenshotUrls: trade.screenshotUrls
        ? JSON.parse(JSON.stringify(trade.screenshotUrls))
        : undefined,
      createdAt: trade.createdAt,
      updatedAt: trade.updatedAt,
      isFavorite: false, // 匯出時暫不需要此資訊
      collectionCount: 0, // 匯出時暫不需要此資訊
    }))

    return NextResponse.json({ data: transformedTrades })
  } catch (error) {
    console.error('Export API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
