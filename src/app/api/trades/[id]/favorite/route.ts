import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/trades/[id]/favorite
 * 切換交易的喜歡狀態
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tradeId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 檢查交易是否存在且屬於當前使用者
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      select: { userId: true, isFavorite: true },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 切換喜歡狀態
    const updatedTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: { isFavorite: !trade.isFavorite },
      select: { id: true, isFavorite: true },
    })

    return NextResponse.json({
      success: true,
      data: updatedTrade,
    })
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
