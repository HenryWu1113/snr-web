/**
 * 趨勢線類型管理 API (單一項目)
 */

import { NextRequest } from 'next/server'
import { createOptionCrudHandlers } from '@/lib/api-helpers'

const handlers = createOptionCrudHandlers('trendlineType')

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handlers.handlePut(request, id)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handlers.handleDelete(request, id)
}
