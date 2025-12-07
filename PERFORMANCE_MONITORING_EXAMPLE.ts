/**
 * 使用效能監控的 API 範例
 * 
 * 在 DataTable API 中整合效能監控
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import performanceMonitor from '@/lib/performance-monitor'
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
    const user = await performanceMonitor.measure(
      'Auth: getUser',
      async () => {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')
        return user
      },
      'api'
    )

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

    // 7. 並行執行資料查詢與計數查詢（加上效能監控）
    const [trades, totalCount] = await performanceMonitor.measure(
      `DB: fetchTrades (page=${page}, pageSize=${pageSize})`,
      async () => {
        return Promise.all([
          prisma.trade.findMany({
            where: whereClause,
            orderBy: orderByClause,
            skip,
            take,
            include: {
              commodity: { select: { id: true, name: true } },
              timeframe: { select: { id: true, name: true } },
              trendlineType: { select: { id: true, name: true } },
              tradeType: { select: { id: true, name: true } },
              tradeEntryTypes: {
                include: {
                  entryType: { select: { id: true, name: true } },
                },
              },
              tradeTags: {
                include: {
                  tag: { select: { id: true, name: true } },
                },
              },
              _count: {
                select: { tradeCollections: true },
              },
            },
          }),
          prisma.trade.count({ where: whereClause }),
        ])
      },
      'db'
    )

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
      position: trade.position as 'LONG' | 'SHORT',
      entryTypes: trade.tradeEntryTypes.map((tet) => tet.entryType),
      tradingSession: trade.tradingSession as 'ASIAN' | 'LONDON' | 'NEWYORK' | 'OVERLAP' | null,
      holdingTimeMinutes: trade.holdingTimeMinutes,
      tradeTags: trade.tradeTags,
      isFavorite: trade.isFavorite,
      collectionCount: trade._count?.tradeCollections || 0,
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
