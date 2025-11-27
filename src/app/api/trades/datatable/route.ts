/**
 * DataTable API Route
 * 處理交易紀錄的 server-side 分頁、篩選、排序
 *
 * POST /api/trades/datatable
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
  buildTradeWhereClause,
  buildTradeOrderByClause,
  calculatePaginationMeta,
  normalizeDataTableRequest,
  validateSortFields,
} from '@/lib/datatable'
import type {
  TradeDataTableRequest,
  TradeDataTableResponse,
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

    // 3. 規範化請求參數
    const normalizedRequest = normalizeDataTableRequest(body)

    // 4. 驗證排序欄位
    if (!validateSortFields(normalizedRequest.sort)) {
      return NextResponse.json(
        { error: 'Invalid sort fields' },
        { status: 400 }
      )
    }

    // 5. 建構 Prisma 查詢條件
    const whereClause = buildTradeWhereClause(normalizedRequest.filters, user.id)
    const orderByClause = buildTradeOrderByClause(normalizedRequest.sort)

    // 6. 計算分頁參數
    const { page, pageSize } = normalizedRequest.pagination
    const skip = (page - 1) * pageSize
    const take = pageSize

    // 7. 並行執行資料查詢與計數查詢
    const [trades, totalCount] = await Promise.all([
      prisma.trade.findMany({
        where: whereClause,
        orderBy: orderByClause,
        skip,
        take,
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
        },
      }),
      prisma.trade.count({
        where: whereClause,
      }),
    ])

    // 8. 轉換資料格式
    const transformedTrades: TradeWithRelations[] = trades.map((trade) => ({
      id: trade.id,
      userId: trade.userId,
      tradeDate: trade.tradeDate,
      orderDate: trade.orderDate,
      tradeType: trade.tradeType,
      commodity: trade.commodity,
      timeframe: trade.timeframe,
      trendlineType: trade.trendlineType,
      entryTypes: trade.tradeEntryTypes.map((tet) => tet.entryType),
      stopLossTicks: trade.stopLossTicks,
      targetRRatio: trade.targetRRatio,
      targetTicks: trade.targetTicks,
      actualExitTicks: trade.actualExitTicks,
      actualRMultiple: Number(trade.actualRMultiple),
      profitLoss: Number(trade.profitLoss),
      winLoss: trade.winLoss as 'win' | 'loss' | 'breakeven',
      notes: trade.notes || undefined,
      screenshotUrls: trade.screenshotUrls
        ? JSON.parse(JSON.stringify(trade.screenshotUrls))
        : undefined,
      createdAt: trade.createdAt,
      updatedAt: trade.updatedAt,
    }))

    // 9. 計算分頁資訊
    const paginationMeta = calculatePaginationMeta(page, pageSize, totalCount)

    // 10. 建構回應
    const response: TradeDataTableResponse = {
      data: transformedTrades,
      meta: paginationMeta,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('DataTable API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
