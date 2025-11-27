/**
 * 進場類型選項 API
 * GET /api/options/entry-types
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entryTypes = await prisma.entryType.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true },
    })

    return NextResponse.json({ data: entryTypes })
  } catch (error) {
    console.error('Get Entry Types Error:', error)
    return NextResponse.json({ error: 'Failed to load entry types' }, { status: 500 })
  }
}
