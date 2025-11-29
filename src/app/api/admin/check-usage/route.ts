/**
 * 檢查選項引用狀況 API
 * GET /api/admin/check-usage?type=xxx&id=xxx
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') // e.g., 'trade-types'
  const id = searchParams.get('id')

  if (!type || !id) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    let count = 0

    switch (type) {
      case 'trade-types':
        count = await prisma.trade.count({ where: { tradeTypeId: id } })
        break
      case 'commodities':
        count = await prisma.trade.count({ where: { commodityId: id } })
        break
      case 'timeframes':
        count = await prisma.trade.count({ where: { timeframeId: id } })
        break
      case 'trendline-types':
        count = await prisma.trade.count({ where: { trendlineTypeId: id } })
        break
      case 'entry-types':
        // EntryType 是多對多，要查 TradeEntryType
        count = await prisma.tradeEntryType.count({ where: { entryTypeId: id } })
        break
      default:
        // 如果傳入未知的 type，暫時回傳 0，避免阻擋刪除
        console.warn(`Unknown type for usage check: ${type}`)
        count = 0
    }

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Check usage error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
