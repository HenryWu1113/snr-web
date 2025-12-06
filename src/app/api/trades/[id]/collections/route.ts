import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/trades/[id]/collections
 * 獲取交易所屬的所有收藏分類
 */
export async function GET(
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
      select: { userId: true },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tradeCollections = await prisma.tradeCollection.findMany({
      where: { tradeId },
      include: {
        collection: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: tradeCollections.map((tc) => tc.collection),
    })
  } catch (error) {
    console.error('Error fetching trade collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/trades/[id]/collections
 * 將交易加入收藏分類（支援批量）
 */
export async function POST(
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

    const body = await request.json()
    const { collectionIds } = body

    if (!Array.isArray(collectionIds) || collectionIds.length === 0) {
      return NextResponse.json(
        { error: 'collectionIds must be a non-empty array' },
        { status: 400 }
      )
    }

    // 檢查交易是否存在且屬於當前使用者
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      select: { userId: true },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 驗證所有收藏分類都屬於當前使用者
    const collections = await prisma.collection.findMany({
      where: {
        id: { in: collectionIds },
        userId: user.id,
      },
    })

    if (collections.length !== collectionIds.length) {
      return NextResponse.json(
        { error: 'Some collections not found or not accessible' },
        { status: 400 }
      )
    }

    // 批量新增（使用 createMany 會自動忽略已存在的）
    await prisma.tradeCollection.createMany({
      data: collectionIds.map((collectionId) => ({
        tradeId,
        collectionId,
      })),
      skipDuplicates: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Trade added to collections',
    })
  } catch (error) {
    console.error('Error adding trade to collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/trades/[id]/collections
 * 更新交易的收藏分類（完全替換）
 */
export async function PUT(
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

    const body = await request.json()
    const { collectionIds } = body

    if (!Array.isArray(collectionIds)) {
      return NextResponse.json(
        { error: 'collectionIds must be an array' },
        { status: 400 }
      )
    }

    // 檢查交易是否存在且屬於當前使用者
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      select: { userId: true },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 如果有收藏分類 ID，驗證它們都屬於當前使用者
    if (collectionIds.length > 0) {
      const collections = await prisma.collection.findMany({
        where: {
          id: { in: collectionIds },
          userId: user.id,
        },
      })

      if (collections.length !== collectionIds.length) {
        return NextResponse.json(
          { error: 'Some collections not found or not accessible' },
          { status: 400 }
        )
      }
    }

    // 使用 transaction 確保原子性
    await prisma.$transaction([
      // 先刪除所有現有的關聯
      prisma.tradeCollection.deleteMany({
        where: { tradeId },
      }),
      // 如果有新的關聯，則建立
      ...(collectionIds.length > 0
        ? [
            prisma.tradeCollection.createMany({
              data: collectionIds.map((collectionId) => ({
                tradeId,
                collectionId,
              })),
            }),
          ]
        : []),
    ])

    return NextResponse.json({
      success: true,
      message: 'Trade collections updated',
    })
  } catch (error) {
    console.error('Error updating trade collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
