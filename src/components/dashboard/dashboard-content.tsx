/**
 * 首頁儀表板內容組件（Client Component）
 */

'use client'

import { useState, useMemo } from 'react'
import { StatCard } from '@/components/dashboard/stat-card'
import { ActivityCalendar } from '@/components/dashboard/activity-calendar'
import { PerformanceCharts } from '@/components/dashboard/performance-charts'
import { DateRangeSelector } from '@/components/dashboard/date-range-selector'
import { TrendingUp, Target, DollarSign, BarChart3 } from 'lucide-react'
import { Trade } from '@prisma/client'
import { calculateStats, groupTradesByDate } from '@/lib/stats'
import { startOfWeek, endOfWeek } from 'date-fns'

interface DashboardContentProps {
  trades: Trade[]
  userName: string
}

export function DashboardContent({ trades, userName }: DashboardContentProps) {
  // 預設本週
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date()
    return {
      from: startOfWeek(today, { weekStartsOn: 1 }),
      to: endOfWeek(today, { weekStartsOn: 1 }),
    }
  })

  // 根據選定的時間範圍篩選交易
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const tradeDate = new Date(trade.tradeDate)
      return tradeDate >= dateRange.from && tradeDate <= dateRange.to
    })
  }, [trades, dateRange])

  // 計算統計數據
  const stats = useMemo(() => calculateStats(filteredTrades), [filteredTrades])

  // 按日期分組（用於熱力圖，使用全部交易）
  const dailyData = useMemo(() => groupTradesByDate(trades, 'tradeDate'), [trades])

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
            <p className="text-muted-foreground mt-1">歡迎回來，{userName}</p>
          </div>
          <DateRangeSelector onRangeChange={setDateRange} />
        </div>
      </header>

      {/* 統計卡片區 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="總交易次數"
          value={stats.totalTrades}
          icon={BarChart3}
          subtitle={`${stats.winningTrades} 勝 / ${stats.losingTrades} 敗`}
        />
        <StatCard
          title="勝率"
          value={`${stats.winRate.toFixed(1)}%`}
          icon={Target}
          trend={stats.winRate >= 50 ? 'up' : 'down'}
          subtitle={
            stats.winRate >= 50
              ? '表現良好'
              : stats.winRate > 0
              ? '需要改進'
              : '開始交易'
          }
        />
        <StatCard
          title="平均 R 倍數"
          value={stats.avgRMultiple.toFixed(2) + 'R'}
          icon={TrendingUp}
          trend={
            stats.avgRMultiple > 0 ? 'up' : stats.avgRMultiple < 0 ? 'down' : 'neutral'
          }
          subtitle={`總計: ${stats.totalRMultiple.toFixed(2)}R`}
        />
        <StatCard
          title="總損益"
          value={`$${stats.totalProfitLoss.toFixed(0)}`}
          icon={DollarSign}
          trend={
            stats.totalProfitLoss > 0
              ? 'up'
              : stats.totalProfitLoss < 0
              ? 'down'
              : 'neutral'
          }
          subtitle={
            stats.totalProfitLoss > 0
              ? '累積獲利'
              : stats.totalProfitLoss < 0
              ? '累積虧損'
              : '損益平衡'
          }
        />
      </div>

      {/* 績效圖表 */}
      {filteredTrades.length > 0 ? (
        <div className="mb-8">
          <PerformanceCharts trades={filteredTrades} />
        </div>
      ) : (
        /* 提示區塊 */
        <div className="mb-8 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">此區間無交易紀錄</h2>
          <p className="text-muted-foreground">
            選定的時間區間內沒有交易紀錄。請嘗試選擇其他時間範圍。
          </p>
        </div>
      )}

      {/* 交易活動日曆（移到最下方） */}
      <ActivityCalendar dailyData={dailyData} />
    </>
  )
}

