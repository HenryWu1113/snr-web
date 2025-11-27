/**
 * 交易類型選項 API
 * GET /api/options/trade-types
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tradeTypes = await prisma.tradeType.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true },
    })

    return NextResponse.json({ data: tradeTypes })
  } catch (error) {
    console.error('Get Trade Types Error:', error)
    return NextResponse.json({ error: 'Failed to load trade types' }, { status: 500 })
  }
}
