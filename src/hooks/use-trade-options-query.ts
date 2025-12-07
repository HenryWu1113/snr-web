'use client'

/**
 * 使用 React Query 優化的選項資料 Hooks
 * 自動處理快取、重新載入、錯誤處理
 */

import { useQuery } from '@tanstack/react-query'

// 選項資料的型別定義
export interface Option {
  id: string
  name: string
}

export interface TradeOptions {
  tradeTypes: Option[]
  commodities: Option[]
  timeframes: Option[]
  entryTypes: Option[]
  trendlineTypes: Option[]
  tradingTags: Option[]
}

// ==========================================
// Query Keys（集中管理，方便重用和無效化）
// ==========================================

export const optionKeys = {
  all: ['options'] as const,
  tradeTypes: ['options', 'trade-types'] as const,
  commodities: ['options', 'commodities'] as const,
  timeframes: ['options', 'timeframes'] as const,
  entryTypes: ['options', 'entry-types'] as const,
  trendlineTypes: ['options', 'trendline-types'] as const,
  tradingTags: ['options', 'trading-tags'] as const,
}

// ==========================================
// Fetch 函數
// ==========================================

async function fetchOption(endpoint: string): Promise<Option[]> {
  const res = await fetch(`/api/options/${endpoint}`)
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`)
  const data = await res.json()
  return data.data || []
}

// ==========================================
// Individual Hooks（單一選項）
// ==========================================

export function useTradeTypes() {
  return useQuery({
    queryKey: optionKeys.tradeTypes,
    queryFn: () => fetchOption('trade-types'),
    staleTime: Infinity, // 永不過期（除非手動更新）
  })
}

export function useCommodities() {
  return useQuery({
    queryKey: optionKeys.commodities,
    queryFn: () => fetchOption('commodities'),
    staleTime: Infinity,
  })
}

export function useTimeframes() {
  return useQuery({
    queryKey: optionKeys.timeframes,
    queryFn: () => fetchOption('timeframes'),
    staleTime: Infinity,
  })
}

export function useEntryTypes() {
  return useQuery({
    queryKey: optionKeys.entryTypes,
    queryFn: () => fetchOption('entry-types'),
    staleTime: Infinity,
  })
}

export function useTrendlineTypes() {
  return useQuery({
    queryKey: optionKeys.trendlineTypes,
    queryFn: () => fetchOption('trendline-types'),
    staleTime: Infinity,
  })
}

export function useTradingTags() {
  return useQuery({
    queryKey: optionKeys.tradingTags,
    queryFn: () => fetchOption('trading-tags'),
    staleTime: Infinity,
  })
}

// ==========================================
// 組合 Hook（一次取得所有選項）
// ==========================================

export function useAllTradeOptions() {
  const tradeTypesQuery = useTradeTypes()
  const commoditiesQuery = useCommodities()
  const timeframesQuery = useTimeframes()
  const entryTypesQuery = useEntryTypes()
  const trendlineTypesQuery = useTrendlineTypes()
  const tradingTagsQuery = useTradingTags()

  return {
    // 資料
    options: {
      tradeTypes: tradeTypesQuery.data || [],
      commodities: commoditiesQuery.data || [],
      timeframes: timeframesQuery.data || [],
      entryTypes: entryTypesQuery.data || [],
      trendlineTypes: trendlineTypesQuery.data || [],
      tradingTags: tradingTagsQuery.data || [],
    },
    // 載入狀態（任何一個還在載入就是 true）
    isLoading:
      tradeTypesQuery.isLoading ||
      commoditiesQuery.isLoading ||
      timeframesQuery.isLoading ||
      entryTypesQuery.isLoading ||
      trendlineTypesQuery.isLoading ||
      tradingTagsQuery.isLoading,
    // 錯誤狀態
    isError:
      tradeTypesQuery.isError ||
      commoditiesQuery.isError ||
      timeframesQuery.isError ||
      entryTypesQuery.isError ||
      trendlineTypesQuery.isError ||
      tradingTagsQuery.isError,
    // 第一個錯誤
    error:
      tradeTypesQuery.error ||
      commoditiesQuery.error ||
      timeframesQuery.error ||
      entryTypesQuery.error ||
      trendlineTypesQuery.error ||
      tradingTagsQuery.error,
  }
}

// ==========================================
// 輔助函數：無效化快取（選項更新後使用）
// ==========================================

export function invalidateOptions(queryClient: any, type?: string) {
  if (type) {
    // 無效化特定選項
    queryClient.invalidateQueries({ queryKey: ['options', type] })
  } else {
    // 無效化所有選項
    queryClient.invalidateQueries({ queryKey: optionKeys.all })
  }
}
