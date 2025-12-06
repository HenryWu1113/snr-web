import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/collections
 * 獲取當前使用者的所有收藏分類
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const collections = await prisma.collection.findMany({
      where: { userId: user.id },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { tradeCollections: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: collections,
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/collections
 * 建立新的收藏分類
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // 檢查是否已存在同名分類
    const existing = await prisma.collection.findUnique({
      where: {
        userId_name: {
          userId: user.id,
          name: name.trim(),
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Collection with this name already exists' },
        { status: 400 }
      )
    }

    // 獲取最大的 displayOrder
    const maxOrder = await prisma.collection.findFirst({
      where: { userId: user.id },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    })

    const collection = await prisma.collection.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        displayOrder: (maxOrder?.displayOrder ?? -1) + 1,
      },
      include: {
        _count: {
          select: { tradeCollections: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: collection,
    })
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
