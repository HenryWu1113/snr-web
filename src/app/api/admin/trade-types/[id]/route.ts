/**
 * 交易類型管理 API (單一項目)
 * PUT /api/admin/trade-types/[id] - 更新交易類型
 * DELETE /api/admin/trade-types/[id] - 刪除交易類型
 */

import { NextRequest } from 'next/server'
import { createOptionCrudHandlers } from '@/lib/api-helpers'

const handlers = createOptionCrudHandlers('tradeType')

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return handlers.handlePut(request, id)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return handlers.handleDelete(request, id)
}
