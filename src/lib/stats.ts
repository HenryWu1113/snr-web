import { Trade } from '@prisma/client'
import { format } from 'date-fns'

export interface TradeStats {
  totalTrades: number
  winRate: number
  avgRMultiple: number
  totalProfitLoss: number
  totalRMultiple: number
  winningTrades: number
  losingTrades: number
  breakevenTrades: number
  longestWinStreak: number
  longestLossStreak: number
  bestTrade: number
  worstTrade: number
}

export function calculateStats(trades: Trade[]): TradeStats {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgRMultiple: 0,
      totalProfitLoss: 0,
      totalRMultiple: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
      bestTrade: 0,
      worstTrade: 0,
    }
  }

  const winningTrades = trades.filter((t) => t.winLoss === 'win').length
  const losingTrades = trades.filter((t) => t.winLoss === 'loss').length
  const breakevenTrades = trades.filter((t) => t.winLoss === 'breakeven').length

  const totalProfitLoss = trades.reduce(
    (sum, t) => sum + Number(t.profitLoss),
    0
  )
  const totalRMultiple = trades.reduce(
    (sum, t) => sum + Number(t.actualExitR),
    0
  )

  // 計算最長連勝/連敗
  let currentWinStreak = 0
  let currentLossStreak = 0
  let longestWinStreak = 0
  let longestLossStreak = 0

  trades.forEach((trade) => {
    if (trade.winLoss === 'win') {
      currentWinStreak++
      currentLossStreak = 0
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak)
    } else if (trade.winLoss === 'loss') {
      currentLossStreak++
      currentWinStreak = 0
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak)
    }
  })

  // 找出最佳/最差交易 (依 R 倍數)
  const rMultiples = trades.map((t) => Number(t.actualExitR))
  const bestTrade = Math.max(...rMultiples)
  const worstTrade = Math.min(...rMultiples)

  return {
    totalTrades: trades.length,
    winRate: (winningTrades / trades.length) * 100,
    avgRMultiple: totalRMultiple / trades.length,
    totalProfitLoss,
    totalRMultiple,
    winningTrades,
    losingTrades,
    breakevenTrades,
    longestWinStreak,
    longestLossStreak,
    bestTrade,
    worstTrade,
  }
}

export interface DailyTradeData {
  date: string // YYYY-MM-DD
  trades: Trade[]
  totalProfitLoss: number
  totalRMultiple: number
  tradeCount: number
}

export function groupTradesByDate(
  trades: Trade[],
  dateField: 'tradeDate' | 'createdAt' | 'orderDate' = 'tradeDate'
): Map<string, DailyTradeData> {
  const grouped = new Map<string, DailyTradeData>()

  trades.forEach((trade) => {
    // 使用 date-fns 的 format 確保正確的本地日期格式
    const date = format(new Date(trade[dateField]), 'yyyy-MM-dd')

    if (!grouped.has(date)) {
      grouped.set(date, {
        date,
        trades: [],
        totalProfitLoss: 0,
        totalRMultiple: 0,
        tradeCount: 0,
      })
    }

    const data = grouped.get(date)!
    data.trades.push(trade)
    data.totalProfitLoss += Number(trade.profitLoss)
    data.totalRMultiple += Number(trade.actualExitR)
    data.tradeCount++
  })

  return grouped
}
