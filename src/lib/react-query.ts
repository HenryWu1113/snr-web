/**
 * React Query 設定
 * 集中管理所有查詢的預設設定
 */

import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 預設設定
        staleTime: 1000 * 60 * 5, // 5 分鐘內視為新鮮資料
        gcTime: 1000 * 60 * 60, // 1 小時後從快取移除（新版改名為 gcTime）
        retry: 1, // 失敗重試 1 次
        refetchOnWindowFocus: false, // 視窗 focus 時不自動重新載入
        refetchOnReconnect: true, // 網路重連時重新載入
      },
      mutations: {
        retry: 0, // 變更操作不重試
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: 每次渲染都建立新的
    return makeQueryClient()
  } else {
    // Browser: 重用單一實例
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}
