/**
 * 趨勢線類型選項 API
 * GET /api/options/trendline-types
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const trendlineTypes = await prisma.trendlineType.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true },
    })

    return NextResponse.json({ data: trendlineTypes })
  } catch (error) {
    console.error('Get Trendline Types Error:', error)
    return NextResponse.json({ error: 'Failed to load trendline types' }, { status: 500 })
  }
}
