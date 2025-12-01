import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { groupStatsByDimension, calculateStats } from '@/lib/stats'
import { Commodity, TradeType, Timeframe, TrendlineType } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dimension = searchParams.get('dimension') as
      | 'commodity'
      | 'tradeType'
      | 'timeframe'
      | 'trendline'
      | 'position'
      | 'entryType'
      | 'tradingSession'
      | 'tags'
      | 'holdingTime'
      | null
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!dimension) {
      return NextResponse.json(
        { error: '缺少 dimension 參數' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // 構建查詢條件
    const where: any = { userId }

    // 如果有日期範圍，添加到查詢條件
    if (from && to) {
      where.orderDate = {
        gte: new Date(from),
        lte: new Date(to),
      }
    }

    // 獲取交易數據
    const trades = await prisma.trade.findMany({
      where,
      orderBy: { orderDate: 'asc' },
      include: {
        tradeEntryTypes: true, // 載入進場類型關聯
        tradeTags: {
          include: {
            tag: true,
          },
        },
      },
    })

    // 如果沒有交易數據，返回空結果
    if (trades.length === 0) {
      return NextResponse.json({
        dimension,
        stats: [],
        overall: calculateStats([]),
      })
    }

    // 獲取對應的維度數據（名稱映射）
    let dimensionData = new Map<string, string>()

    switch (dimension) {
      case 'commodity': {
        const commodities = await prisma.commodity.findMany({
          where: { isActive: true },
        })
        commodities.forEach((c: Commodity) => dimensionData.set(c.id, c.name))
        break
      }
      case 'tradeType': {
        const tradeTypes = await prisma.tradeType.findMany({
          where: { isActive: true },
        })
        tradeTypes.forEach((t: TradeType) => dimensionData.set(t.id, t.name))
        break
      }
      case 'timeframe': {
        const timeframes = await prisma.timeframe.findMany({
          where: { isActive: true },
        })
        timeframes.forEach((t: Timeframe) => dimensionData.set(t.id, t.name))
        break
      }
      case 'trendline': {
        const trendlineTypes = await prisma.trendlineType.findMany({
          where: { isActive: true },
        })
        trendlineTypes.forEach((t: TrendlineType) =>
          dimensionData.set(t.id, t.name)
        )
        break
      }
      case 'entryType': {
        const entryTypes = await prisma.entryType.findMany({
          where: { isActive: true },
        })
        entryTypes.forEach((t) => dimensionData.set(t.id, t.name))
        break
      }
      case 'position': {
        dimensionData.set('LONG', '做多')
        dimensionData.set('SHORT', '做空')
        break
      }
      case 'tradingSession': {
        dimensionData.set('ASIAN', '亞洲盤')
        dimensionData.set('LONDON', '倫敦盤')
        dimensionData.set('NEWYORK', '紐約盤')
        dimensionData.set('OVERLAP', '重疊時段')
        break
      }
      case 'tags': {
        const tags = await prisma.tradingTag.findMany({
          where: { isActive: true },
        })
        tags.forEach((t) => dimensionData.set(t.id, t.name))
        break
      }
      case 'holdingTime': {
        // 持倉時間分組
        dimensionData.set('0-30', '0-30分鐘')
        dimensionData.set('30-60', '30-60分鐘')
        dimensionData.set('60-120', '1-2小時')
        dimensionData.set('120-240', '2-4小時')
        dimensionData.set('240+', '4小時以上')
        break
      }
    }

    // 按維度分組統計
    const stats = groupStatsByDimension(trades, dimension, dimensionData)

    // 計算整體統計
    const overall = calculateStats(trades)

    return NextResponse.json({
      dimension,
      stats,
      overall,
      from: from || null,
      to: to || null,
    })
  } catch (error) {
    console.error('統計分析 API 錯誤:', error)
    return NextResponse.json(
      { error: '獲取統計分析數據失敗' },
      { status: 500 }
    )
  }
}

