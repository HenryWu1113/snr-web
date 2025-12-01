/**
 * 交易時段判斷工具
 * 根據交易日期時間自動判斷屬於哪個交易時段
 */

import { TradingSession } from '@prisma/client'

/**
 * 根據交易日期時間判斷交易時段
 * 
 * 時段定義（UTC 時間）：
 * - 亞洲盤 (ASIAN): 00:00-08:00 UTC
 * - 倫敦盤 (LONDON): 08:00-13:00 UTC  
 * - 重疊時段 (OVERLAP): 13:00-17:00 UTC（倫敦+紐約）
 * - 紐約盤 (NEWYORK): 17:00-22:00 UTC
 * - 亞洲盤 (ASIAN): 22:00-24:00 UTC
 * 
 * @param tradeDate 交易日期時間（任何時區的 Date 物件）
 * @returns TradingSession 枚舉值
 */
export function determineTradingSession(tradeDate: Date): TradingSession {
  // 取得 UTC 小時數（0-23）
  const utcHour = tradeDate.getUTCHours()

  // 亞洲盤：00:00-08:00 UTC (台北時間 08:00-16:00)
  if (utcHour >= 0 && utcHour < 8) {
    return 'ASIAN'
  }
  // 倫敦盤：08:00-13:00 UTC (台北時間 16:00-21:00)
  else if (utcHour >= 8 && utcHour < 13) {
    return 'LONDON'
  }
  // 重疊時段：13:00-17:00 UTC (台北時間 21:00-01:00)
  else if (utcHour >= 13 && utcHour < 17) {
    return 'OVERLAP'
  }
  // 紐約盤：17:00-22:00 UTC (台北時間 01:00-06:00)
  else if (utcHour >= 17 && utcHour < 22) {
    return 'NEWYORK'
  }
  // 亞洲盤深夜時段：22:00-24:00 UTC (台北時間 06:00-08:00)
  else {
    return 'ASIAN'
  }
}

/**
 * 取得交易時段的中文顯示名稱
 */
export function getTradingSessionLabel(session: TradingSession | null | undefined): string {
  if (!session) return '-'
  
  const labels: Record<TradingSession, string> = {
    ASIAN: '亞洲盤',
    LONDON: '倫敦盤',
    NEWYORK: '紐約盤',
    OVERLAP: '重疊時段'
  }
  
  return labels[session] || '-'
}

/**
 * 取得交易時段的顏色配置（用於 UI 顯示）
 */
export function getTradingSessionColor(session: TradingSession | null | undefined): string {
  if (!session) return 'bg-gray-500'
  
  const colors: Record<TradingSession, string> = {
    ASIAN: 'bg-amber-500',     // 琥珀色
    LONDON: 'bg-blue-500',     // 藍色
    NEWYORK: 'bg-purple-500',  // 紫色
    OVERLAP: 'bg-green-500'    // 綠色（最活躍時段）
  }
  
  return colors[session] || 'bg-gray-500'
}

/**
 * 取得交易時段的 UTC 時間範圍說明
 */
export function getTradingSessionTimeRange(session: TradingSession): string {
  const ranges: Record<TradingSession, string> = {
    ASIAN: '00:00-08:00 & 22:00-24:00 UTC',
    LONDON: '08:00-13:00 UTC',
    OVERLAP: '13:00-17:00 UTC',
    NEWYORK: '17:00-22:00 UTC'
  }
  
  return ranges[session]
}

/**
 * 取得所有交易時段選項（用於篩選器等）
 */
export function getAllTradingSessions(): Array<{
  value: TradingSession
  label: string
  color: string
}> {
  return [
    { value: 'ASIAN', label: '亞洲盤', color: getTradingSessionColor('ASIAN') },
    { value: 'LONDON', label: '倫敦盤', color: getTradingSessionColor('LONDON') },
    { value: 'OVERLAP', label: '重疊時段', color: getTradingSessionColor('OVERLAP') },
    { value: 'NEWYORK', label: '紐約盤', color: getTradingSessionColor('NEWYORK') }
  ]
}
