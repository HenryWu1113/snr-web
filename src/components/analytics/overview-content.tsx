/**
 * 統計分析總覽組件（Client Component）
 */

'use client'

import { useState, useMemo } from 'react'
import { Trade } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PerformanceCharts } from '@/components/dashboard/performance-charts'
import { DateRangeSelector } from '@/components/dashboard/date-range-selector'
import { calculateStats } from '@/lib/stats'
import { startOfWeek, endOfWeek } from 'date-fns'
import {
  BarChart3,
  TrendingUp,
  Target,
  DollarSign,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AnalyticsOverviewContentProps {
  trades: Trade[]
  userName: string
}

interface QuickStat {
  title: string
  value: string
  subtitle: string
  href: string
  icon: React.ReactNode
}

export function AnalyticsOverviewContent({
  trades,
  userName,
}: AnalyticsOverviewContentProps) {
  // 預設過去 365 天
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date()
    const end = new Date(today)
    end.setHours(23, 59, 59, 999)
    
    const start = new Date(today)
    start.setDate(today.getDate() - 365)
    start.setHours(0, 0, 0, 0)

    return {
      from: start,
      to: end,
    }
  })

  // 根據日期範圍篩選交易
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const orderDate = new Date(trade.orderDate)
      return orderDate >= dateRange.from && orderDate <= dateRange.to
    })
  }, [trades, dateRange])

  // 計算統計數據
  const stats = useMemo(() => calculateStats(filteredTrades), [filteredTrades])

  // 快速導航卡片
  const quickStats: QuickStat[] = [
    {
      title: '商品分析',
      value: '查看',
      subtitle: '分析不同商品的表現',
      href: '/analytics/commodity',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: '交易類型分析',
      value: '查看',
      subtitle: '比較實盤與回測表現',
      href: '/analytics/trade-type',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: '時間框架分析',
      value: '查看',
      subtitle: '分析不同時間框架效果',
      href: '/analytics/timeframe',
      icon: <Target className="h-5 w-5" />,
    },
    {
      title: '趨勢線類型分析',
      value: '查看',
      subtitle: '比較不同趨勢線策略',
      href: '/analytics/trendline',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: '做多/做空分析',
      value: '查看',
      subtitle: '比較多空方向表現',
      href: '/analytics/position',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: '進場類型分析',
      value: '查看',
      subtitle: '比較不同進場策略表現',
      href: '/analytics/entry-type',
      icon: <ArrowRight className="h-5 w-5" />,
    },
  ]

  return (
    <>
      {/* 日期範圍選擇器 */}
      <div className="flex justify-end mb-6">
        <DateRangeSelector 
          onRangeChange={setDateRange} 
          defaultPreset="custom"
          defaultCustomRange={dateRange}
        />
      </div>

      {/* 績效趨勢圖（從儀表板複用） */}
      {filteredTrades.length > 0 && (
        <div className="mb-8">
          <PerformanceCharts trades={filteredTrades} dateRange={dateRange} />
        </div>
      )}

      {/* 快速摘要卡片 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">整體表現</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總交易次數</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrades}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 font-medium">{stats.winningTrades} 勝</span> / 
                <span className="text-red-600 font-medium ml-1">{stats.losingTrades} 敗</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">勝率</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.winRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.winRate >= 50 ? '表現良好' : '需要改進'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均 R 倍數</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.avgRMultiple > 0 ? 'text-green-600' : stats.avgRMultiple < 0 ? 'text-red-600' : ''}`}>
                {stats.avgRMultiple > 0 ? '+' : ''}{stats.avgRMultiple.toFixed(2)}R
              </div>
              <p className="text-xs text-muted-foreground">
                總計: <span className={stats.totalRMultiple > 0 ? 'text-green-600' : stats.totalRMultiple < 0 ? 'text-red-600' : ''}>
                  {stats.totalRMultiple > 0 ? '+' : ''}{stats.totalRMultiple.toFixed(2)}R
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總損益</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalProfitLoss > 0 ? 'text-green-600' : stats.totalProfitLoss < 0 ? 'text-red-600' : ''}`}>
                ${stats.totalProfitLoss.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                平均: <span className={stats.avgProfitLoss > 0 ? 'text-green-600' : stats.avgProfitLoss < 0 ? 'text-red-600' : ''}>
                  ${stats.avgProfitLoss.toFixed(0)}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 詳細分析導航 */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">詳細分析</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickStats.map((stat) => (
            <Card
              key={stat.title}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Link href={stat.href}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {stat.subtitle}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    查看詳細分析
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
