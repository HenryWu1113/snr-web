import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/collections/[id]
 * 更新收藏分類
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    // 檢查收藏分類是否存在且屬於當前使用者
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    if (collection.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 如果更新名稱，檢查是否與其他分類重複
    if (name && typeof name === 'string' && name.trim().length > 0) {
      const existing = await prisma.collection.findFirst({
        where: {
          userId: user.id,
          name: name.trim(),
          id: { not: collectionId },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Collection with this name already exists' },
          { status: 400 }
        )
      }
    }

    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
      },
      include: {
        _count: {
          select: { tradeCollections: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedCollection,
    })
  } catch (error) {
    console.error('Error updating collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/collections/[id]
 * 刪除收藏分類（會自動刪除相關的 TradeCollection 記錄）
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 檢查收藏分類是否存在且屬於當前使用者
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    if (collection.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 刪除收藏分類（Cascade 會自動刪除相關的 TradeCollection）
    await prisma.collection.delete({
      where: { id: collectionId },
    })

    return NextResponse.json({
      success: true,
      message: 'Collection deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
