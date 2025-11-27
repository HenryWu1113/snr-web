/**
 * 時間框架選項 API
 * GET /api/options/timeframes
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const timeframes = await prisma.timeframe.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true },
    })

    return NextResponse.json({ data: timeframes })
  } catch (error) {
    console.error('Get Timeframes Error:', error)
    return NextResponse.json({ error: 'Failed to load timeframes' }, { status: 500 })
  }
}
