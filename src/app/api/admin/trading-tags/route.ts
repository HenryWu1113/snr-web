/**
 * 自定義標籤管理 API
 */

import { NextRequest } from 'next/server'
import { createOptionCrudHandlers } from '@/lib/api-helpers'

const handlers = createOptionCrudHandlers('tradingTag')

export async function GET(request: NextRequest) {
  return handlers.handleGet(request)
}

export async function POST(request: NextRequest) {
  return handlers.handlePost(request)
}

export async function PATCH(request: NextRequest) {
  return handlers.handleBatchUpdateOrder(request)
}
