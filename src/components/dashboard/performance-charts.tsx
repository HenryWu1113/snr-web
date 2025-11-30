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
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts'
import { Trade } from '@prisma/client'
import { format, subDays, eachDayOfInterval, isToday } from 'date-fns'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  AlertCircle,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

interface PerformanceChartsProps {
  trades: Trade[]
  dateRange: { from: Date; to: Date }
}

export function PerformanceCharts({ trades, dateRange }: PerformanceChartsProps) {
  const [metric, setMetric] = useState<'r' | 'profit'>('r')

  if (trades.length === 0) {
    return null
  }

  // 1. 計算選定區間的累積績效（R 倍數）
  const getPerformanceTrendData = () => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })

    let cumulativeR = 0
    let cumulativeProfit = 0

    return days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd')
      // 使用下單日期（orderDate）來分組交易
      const dayTrades = trades.filter(
        (t) => format(new Date(t.orderDate), 'yyyy-MM-dd') === dayStr
      )

      cumulativeR += dayTrades.reduce(
        (sum, t) => sum + Number(t.actualExitR),
        0
      )

      cumulativeProfit += dayTrades.reduce(
        (sum, t) => sum + Number(t.profitLoss),
        0
      )

      return {
        date: format(day, 'yyyy/MM/dd'),
        累積R: parseFloat(cumulativeR.toFixed(2)),
        累積損益: parseFloat(cumulativeProfit.toFixed(0)),
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
  const totalProfit = trades.reduce((sum, t) => sum + Number(t.profitLoss), 0)
  const isPositiveR = totalR > 0
  const isPositiveProfit = totalProfit > 0

  // 找出今天在圖表中的 X 軸位置
  const todayDateStr = format(new Date(), 'yyyy/MM/dd')
  const todayDataPoint = trendData.find((d) => d.date === todayDateStr)

  // Chart 配置
  const areaChartConfig = {
    累積R: {
      label: '累積 R 倍數',
      color: isPositiveR ? 'hsl(142.1 76.2% 36.3%)' : 'hsl(0 84.2% 60.2%)'
    },
    累積損益: {
      label: '累積損益',
      color: isPositiveProfit ? 'hsl(142.1 76.2% 36.3%)' : 'hsl(0 84.2% 60.2%)'
    },
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
            <div className='flex items-center gap-4'>
              {/* 切換 R / 損益 */}
              <Tabs value={metric} onValueChange={(v) => setMetric(v as 'r' | 'profit')}>
                <TabsList>
                  <TabsTrigger 
                    value="r"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
                  >
                    R 倍數
                  </TabsTrigger>
                  <TabsTrigger 
                    value="profit"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
                  >
                    損益
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* 顯示當前總計 */}
              {metric === 'r' ? (
                <div className='flex items-center gap-2'>
                  {isPositiveR ? (
                    <TrendingUp className='h-5 w-5 text-emerald-500' />
                  ) : totalR < 0 ? (
                    <TrendingDown className='h-5 w-5 text-red-500' />
                  ) : (
                    <Minus className='h-5 w-5 text-gray-500' />
                  )}
                  <span
                    className={cn(
                      'text-lg font-semibold',
                      isPositiveR
                        ? 'text-emerald-500'
                        : totalR < 0
                        ? 'text-red-500'
                        : 'text-gray-500'
                    )}
                  >
                    {totalR > 0 ? '+' : ''}
                    {totalR.toFixed(2)}R
                  </span>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  {isPositiveProfit ? (
                    <TrendingUp className='h-5 w-5 text-emerald-500' />
                  ) : totalProfit < 0 ? (
                    <TrendingDown className='h-5 w-5 text-red-500' />
                  ) : (
                    <Minus className='h-5 w-5 text-gray-500' />
                  )}
                  <span
                    className={cn(
                      'text-lg font-semibold',
                      isPositiveProfit
                        ? 'text-emerald-500'
                        : totalProfit < 0
                        ? 'text-red-500'
                        : 'text-gray-500'
                    )}
                  >
                    ${totalProfit > 0 ? '+' : ''}
                    {totalProfit.toFixed(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {metric === 'r' ? (
            <ChartContainer config={areaChartConfig} className='h-[250px] w-full'>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id='colorR' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor={isPositiveR ? '#10b981' : '#ef4444'}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset='95%'
                      stopColor={isPositiveR ? '#10b981' : '#ef4444'}
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
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                
                {/* 今日標記（僅參考線） */}
                {todayDataPoint && (
                  <ReferenceLine
                    x={todayDateStr}
                    stroke='hsl(217.2 91.2% 59.8%)'
                    strokeWidth={2}
                    strokeDasharray='5 5'
                  />
                )}
                
                <Area
                  type='monotone'
                  dataKey='累積R'
                  stroke={isPositiveR ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  fill='url(#colorR)'
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <ChartContainer config={areaChartConfig} className='h-[250px] w-full'>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id='colorProfit' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor={isPositiveProfit ? '#10b981' : '#ef4444'}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset='95%'
                      stopColor={isPositiveProfit ? '#10b981' : '#ef4444'}
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
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                
                {/* 今日標記（僅參考線） */}
                {todayDataPoint && (
                  <ReferenceLine
                    x={todayDateStr}
                    stroke='hsl(217.2 91.2% 59.8%)'
                    strokeWidth={2}
                    strokeDasharray='5 5'
                  />
                )}
                
                <Area
                  type='monotone'
                  dataKey='累積損益'
                  stroke={isPositiveProfit ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  fill='url(#colorProfit)'
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
