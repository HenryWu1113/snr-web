/**
 * 首頁績效圖表組件（使用 shadcn/ui chart）
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Trade } from '@prisma/client'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceChartsProps {
  trades: Trade[]
  dateRange: { from: Date; to: Date }
}

export function PerformanceCharts({ trades, dateRange }: PerformanceChartsProps) {
  if (trades.length === 0) {
    return null
  }

  // 1. 計算選定區間的累積績效
  const getPerformanceTrendData = () => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })

    let cumulativeR = 0

    return days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd')
      // 這裡假設 trades 已經被篩選過，但為了累積計算正確，
      // 如果 trades 只有選定區間的資料，那初始 cumulativeR 應該是 0。
      // 如果想要顯示"這段期間的變化"，從 0 開始是合理的。
      const dayTrades = trades.filter(
        (t) => format(new Date(t.tradeDate), 'yyyy-MM-dd') === dayStr
      )

      cumulativeR += dayTrades.reduce(
        (sum, t) => sum + Number(t.actualExitR),
        0
      )

      return {
        date: format(day, 'MM/dd'),
        累積R: parseFloat(cumulativeR.toFixed(2))
      }
    })
  }

  // 2. 計算勝敗平比例
  const getWinLossData = () => {
    const wins = trades.filter((t) => t.winLoss === 'win').length
    const losses = trades.filter((t) => t.winLoss === 'loss').length
    const breakevens = trades.filter((t) => t.winLoss === 'breakeven').length

    return [
      { name: '成功', value: wins, fill: 'hsl(142.1 76.2% 36.3%)' },
      { name: '失敗', value: losses, fill: 'hsl(0 84.2% 60.2%)' },
      { name: '平手', value: breakevens, fill: 'hsl(215.4 16.3% 46.9%)' }
    ].filter((item) => item.value > 0)
  }

  // 3. 最佳商品 (Top Assets)
  const getTopCommodities = () => {
    const commodityStats = new Map<
      string,
      { count: number; totalR: number; totalAmount: number }
    >()

    trades.forEach((t) => {
      if (!t.commodityId) return
      const existing = commodityStats.get(t.commodityId) || {
        count: 0,
        totalR: 0,
        totalAmount: 0
      }
      commodityStats.set(t.commodityId, {
        count: existing.count + 1,
        totalR: existing.totalR + Number(t.actualExitR),
        totalAmount: existing.totalAmount + Number(t.profitLoss)
      })
    })

    const sorted = Array.from(commodityStats.entries())
      .map(([id, stats]) => ({
        name: id.split('-')[0].toUpperCase(),
        count: stats.count,
        totalR: parseFloat(stats.totalR.toFixed(2)),
        totalAmount: parseFloat(stats.totalAmount.toFixed(0))
      }))
      .sort((a, b) => b.totalR - a.totalR)

    return sorted.slice(0, 5) // 取前 5 名
  }

  const trendData = getPerformanceTrendData()
  const winLossData = getWinLossData()
  const topCommodities = getTopCommodities()

  // 計算整體趨勢
  const totalR = trades.reduce((sum, t) => sum + Number(t.actualExitR), 0)
  const isPositive = totalR > 0

  // Chart 配置
  const areaChartConfig = {
    累積R: {
      label: '累積 R 倍數',
      color: isPositive ? 'hsl(142.1 76.2% 36.3%)' : 'hsl(0 84.2% 60.2%)'
    }
  } satisfies ChartConfig

  return (
    <div className='space-y-6'>
      {/* 績效趨勢圖 */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>
              績效趨勢 ({format(dateRange.from, 'yyyy/MM/dd')} - {format(dateRange.to, 'yyyy/MM/dd')})
            </CardTitle>
            <div className='flex items-center gap-2'>
              {isPositive ? (
                <TrendingUp className='h-5 w-5 text-green-500' />
              ) : totalR < 0 ? (
                <TrendingDown className='h-5 w-5 text-red-500' />
              ) : (
                <Minus className='h-5 w-5 text-gray-500' />
              )}
              <span
                className={cn(
                  'text-lg font-semibold',
                  isPositive
                    ? 'text-green-500'
                    : totalR < 0
                    ? 'text-red-500'
                    : 'text-gray-500'
                )}
              >
                {totalR > 0 ? '+' : ''}
                {totalR.toFixed(2)}R
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={areaChartConfig} className='h-[250px] w-full'>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id='colorR' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor={isPositive ? '#22c55e' : '#ef4444'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset='95%'
                    stopColor={isPositive ? '#22c55e' : '#ef4444'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type='monotone'
                dataKey='累積R'
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                fill='url(#colorR)'
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
