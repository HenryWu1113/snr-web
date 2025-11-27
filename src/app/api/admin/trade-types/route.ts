/**
 * 交易類型管理 API
 * GET /api/admin/trade-types - 取得所有交易類型
 * POST /api/admin/trade-types - 新增交易類型
 */

import { NextRequest } from 'next/server'
import { createOptionCrudHandlers } from '@/lib/api-helpers'

const handlers = createOptionCrudHandlers('tradeType')

export async function GET(request: NextRequest) {
  return handlers.handleGet(request)
}

export async function POST(request: NextRequest) {
  return handlers.handlePost(request)
}

export async function PATCH(request: NextRequest) {
  return handlers.handleBatchUpdateOrder(request)
}
