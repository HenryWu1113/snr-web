/**
 * DataTable 後端查詢邏輯
 * 處理分頁、排序、篩選的 Prisma 查詢生成
 */

import { Prisma } from '@prisma/client'
import type {
  TradeDataTableRequest,
  TradeFilters,
  MultiSortConfig,
  PaginationMeta,
} from '@/types/datatable'

// ==========================================
// Prisma 查詢建構器
// ==========================================

/**
 * 建構 Prisma where 條件（從 TradeFilters）
 */
export function buildTradeWhereClause(
  filters: TradeFilters | undefined,
  userId: string
): Prisma.TradeWhereInput {
  if (!filters) {
    return { userId }
  }

  const where: Prisma.TradeWhereInput = {
    userId, // 永遠限制為當前使用者
    AND: [],
  }

  const conditions: Prisma.TradeWhereInput[] = []

  // 日期區間篩選（tradeDate）
  if (filters.dateFrom || filters.dateTo) {
    conditions.push({
      tradeDate: {
        ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
        ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
      },
    })
  }

  // 時間區間篩選（chartTime）
  if (filters.chartTimeFrom || filters.chartTimeTo) {
    conditions.push({
      createdAt: {
        ...(filters.chartTimeFrom && { gte: new Date(filters.chartTimeFrom) }),
        ...(filters.chartTimeTo && { lte: new Date(filters.chartTimeTo) }),
      },
    })
  }

  // 商品篩選（多選）
  if (filters.commodityIds && filters.commodityIds.length > 0) {
    conditions.push({
      commodityId: { in: filters.commodityIds },
    })
  }

  // 時間框架篩選（多選）
  if (filters.timeframeIds && filters.timeframeIds.length > 0) {
    conditions.push({
      timeframeId: { in: filters.timeframeIds },
    })
  }

  // 趨勢線類型篩選（多選）
  if (filters.trendlineTypeIds && filters.trendlineTypeIds.length > 0) {
    conditions.push({
      trendlineTypeId: { in: filters.trendlineTypeIds },
    })
  }


  // 進場模式篩選（多選，多對多關係）
  if (filters.entryTypeIds && filters.entryTypeIds.length > 0) {
    conditions.push({
      tradeEntryTypes: {
        some: {
          entryTypeId: { in: filters.entryTypeIds },
        },
      },
    })
  }

  // 勝敗篩選
  if (filters.winLoss && filters.winLoss !== 'all') {
    conditions.push({
      winLoss: filters.winLoss,
    })
  }

  // R 倍數區間篩選
  if (filters.actualRMultipleMin !== undefined || filters.actualRMultipleMax !== undefined) {
    conditions.push({
      actualRMultiple: {
        ...(filters.actualRMultipleMin !== undefined && { gte: filters.actualRMultipleMin }),
        ...(filters.actualRMultipleMax !== undefined && { lte: filters.actualRMultipleMax }),
      },
    })
  }

  // 關鍵字搜尋（搜尋 notes 欄位）
  if (filters.keyword) {
    conditions.push({
      notes: {
        contains: filters.keyword,
        mode: 'insensitive', // 不區分大小寫
      },
    })
  }

  if (conditions.length > 0) {
    where.AND = conditions
  }

  return where
}

/**
 * 建構 Prisma orderBy 條件（從 MultiSortConfig）
 */
export function buildTradeOrderByClause(
  sort: MultiSortConfig | undefined
): Prisma.TradeOrderByWithRelationInput[] {
  if (!sort || sort.length === 0) {
    // 預設排序：交易日期降序
    return [{ tradeDate: 'desc' }]
  }

  return sort.map((s) => {
    // 處理關聯欄位排序
    if (s.field === 'commodity') {
      return { commodity: { name: s.direction } }
    }
    if (s.field === 'timeframe') {
      return { timeframe: { name: s.direction } }
    }
    if (s.field === 'trendlineType') {
      return { trendlineType: { name: s.direction } }
    }
    if (s.field === 'tradeType') {
      return { tradeType: { name: s.direction } }
    }

    // 一般欄位排序
    return { [s.field]: s.direction } as Prisma.TradeOrderByWithRelationInput
  })
}

/**
 * 計算分頁資訊
 */
export function calculatePaginationMeta(
  currentPage: number,
  pageSize: number,
  totalRecords: number
): PaginationMeta {
  const totalPages = Math.ceil(totalRecords / pageSize)

  return {
    currentPage,
    pageSize,
    totalPages,
    totalRecords,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }
}

/**
 * 驗證並規範化 DataTable 請求
 */
export function normalizeDataTableRequest(
  request: Partial<TradeDataTableRequest>
): TradeDataTableRequest {
  return {
    pagination: {
      page: Math.max(1, request.pagination?.page || 1),
      pageSize: Math.min(100, Math.max(10, request.pagination?.pageSize || 20)),
    },
    sort: request.sort || [],
    filters: request.filters || {},
    columnVisibility: request.columnVisibility || {},
  }
}

/**
 * 驗證排序欄位是否允許
 */
const SORTABLE_FIELDS = [
  'tradeDate',
  'orderDate',
  'createdAt',
  'updatedAt',
  'stopLossTicks',
  'actualExitTicks',
  'actualRMultiple',
  'profitLoss',
  'winLoss',
  'commodity',
  'timeframe',
  'trendlineType',
  'tradeType',
]

export function validateSortFields(sort: MultiSortConfig | undefined): boolean {
  if (!sort) return true
  return sort.every((s) => SORTABLE_FIELDS.includes(s.field))
}
