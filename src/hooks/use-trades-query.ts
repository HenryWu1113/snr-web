'use client'

/**
 * 交易紀錄資料的 React Query Hooks
 * 提供快取、自動重新載入、手動刷新功能
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { TradeDataTableRequest, TradeDataTableResponse } from '@/types/datatable'

// ==========================================
// Query Keys
// ==========================================

export const tradeKeys = {
  all: ['trades'] as const,
  lists: () => [...tradeKeys.all, 'list'] as const,
  list: (params: TradeDataTableRequest) => [...tradeKeys.lists(), params] as const,
}

// ==========================================
// Fetch Function
// ==========================================

async function fetchTrades(request: TradeDataTableRequest): Promise<TradeDataTableResponse> {
  const response = await fetch('/api/trades/datatable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch trades')
  }

  return response.json()
}

// ==========================================
// Hooks
// ==========================================

export function useTrades(request: TradeDataTableRequest) {
  return useQuery({
    queryKey: tradeKeys.list(request),
    queryFn: () => fetchTrades(request),
    staleTime: 1000 * 60, // 1 分鐘快取
    gcTime: 1000 * 60 * 5, // 5 分鐘後從快取移除
  })
}

// ==========================================
// 輔助函數
// ==========================================

/**
 * 手動刷新交易資料
 */
export function useRefreshTrades() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: tradeKeys.lists() })
  }
}

/**
 * 讓特定條件的交易資料失效
 */
export function invalidateTrades(queryClient: any, request?: TradeDataTableRequest) {
  if (request) {
    queryClient.invalidateQueries({ queryKey: tradeKeys.list(request) })
  } else {
    queryClient.invalidateQueries({ queryKey: tradeKeys.lists() })
  }
}
