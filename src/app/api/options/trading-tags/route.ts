/**
 * 自定義標籤選項 API
 * GET /api/options/trading-tags
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tradingTags = await prisma.tradingTag.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true },
    })

    return NextResponse.json({ data: tradingTags })
  } catch (error) {
    console.error('Get Trading Tags Error:', error)
    return NextResponse.json({ error: 'Failed to load trading tags' }, { status: 500 })
  }
}
