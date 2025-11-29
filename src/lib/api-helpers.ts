/**
 * API Helper Functions
 * 通用的 CRUD 操作函數
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * 驗證使用者身份
 */
export async function authenticateUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, error: 'Unauthorized' }
  }

  return { user, error: null }
}

/**
 * 通用的選項 CRUD 操作
 */
export function createOptionCrudHandlers(modelName: string) {
  // @ts-ignore - Prisma 動態模型存取
  const model = prisma[modelName as keyof typeof prisma] as any

  // GET - 取得所有項目
  async function handleGet(request: NextRequest) {
    try {
      const { user, error } = await authenticateUser()
      if (error) {
        return NextResponse.json({ error }, { status: 401 })
      }

      const items = await model.findMany({
        orderBy: { displayOrder: 'asc' },
      })

      return NextResponse.json({ data: items })
    } catch (error) {
      console.error(`Get ${modelName} Error:`, error)
      return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
    }
  }

  // POST - 新增項目
  async function handlePost(request: NextRequest) {
    try {
      const { user, error: authError } = await authenticateUser()
      if (authError) {
        return NextResponse.json({ error: authError }, { status: 401 })
      }

      const body = await request.json()
      const { name, isActive = true } = body

      if (!name || typeof name !== 'string') {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 })
      }

      // 獲取當前最大的 displayOrder
      const maxOrderItem = await model.findFirst({
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      })

      const newItem = await model.create({
        data: {
          name,
          isActive,
          displayOrder: (maxOrderItem?.displayOrder || 0) + 1,
        },
      })

      return NextResponse.json({ data: newItem }, { status: 201 })
    } catch (error) {
      console.error(`Create ${modelName} Error:`, error)

      // 處理唯一性約束錯誤
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json({ error: 'Name already exists' }, { status: 409 })
        }
      }

      return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }
  }

  // PUT - 更新項目
  async function handlePut(request: NextRequest, id: string) {
    try {
      const { user, error: authError } = await authenticateUser()
      if (authError) {
        return NextResponse.json({ error: authError }, { status: 401 })
      }

      const body = await request.json()
      const { name, isActive, displayOrder } = body

      const updateData: any = {}
      if (name !== undefined) updateData.name = name
      if (isActive !== undefined) updateData.isActive = isActive
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder

      const updatedItem = await model.update({
        where: { id },
        data: updateData,
      })

      return NextResponse.json({ data: updatedItem })
    } catch (error) {
      console.error(`Update ${modelName} Error:`, error)

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json({ error: 'Name already exists' }, { status: 409 })
        }
        if (error.code === 'P2025') {
          return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }
      }

      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
    }
  }

  // DELETE - 刪除項目
  async function handleDelete(request: NextRequest, id: string) {
    try {
      const { user, error: authError } = await authenticateUser()
      if (authError) {
        return NextResponse.json({ error: authError }, { status: 401 })
      }

      await model.delete({
        where: { id },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error(`Delete ${modelName} Error:`, error)

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }
        if (error.code === 'P2003') {
          return NextResponse.json(
            { error: 'Cannot delete item with existing references' },
            { status: 409 }
          )
        }
      }

      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
    }
  }

  // PATCH - 批量更新排序
  async function handleBatchUpdateOrder(request: NextRequest) {
    try {
      const { user, error: authError } = await authenticateUser()
      if (authError) {
        return NextResponse.json({ error: authError }, { status: 401 })
      }

      const body = await request.json()
      const { updates } = body

      // 驗證請求格式
      if (!Array.isArray(updates) || updates.length === 0) {
        return NextResponse.json(
          { error: 'Updates array is required' },
          { status: 400 }
        )
      }

      // 使用事務批量更新，確保原子性
      await prisma.$transaction(
        updates.map((update: { id: string; displayOrder: number }) =>
          model.update({
            where: { id: update.id },
            data: { displayOrder: update.displayOrder },
          })
        )
      )

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error(`Batch update ${modelName} order Error:`, error)

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }
      }

      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }
  }

  return {
    handleGet,
    handlePost,
    handlePut,
    handleDelete,
    handleBatchUpdateOrder,
  }
}
