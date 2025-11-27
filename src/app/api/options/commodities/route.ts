/**
 * 商品選項 API
 * GET /api/options/commodities
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const commodities = await prisma.commodity.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true },
    })

    return NextResponse.json({ data: commodities })
  } catch (error) {
    console.error('Get Commodities Error:', error)
    return NextResponse.json({ error: 'Failed to load commodities' }, { status: 500 })
  }
}
