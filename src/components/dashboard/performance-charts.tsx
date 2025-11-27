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
}

export function PerformanceCharts({ trades }: PerformanceChartsProps) {
  if (trades.length === 0) {
    return null
  }

  // 1. 計算最近 30 天的累積績效
  const getLast30DaysData = () => {
    const today = new Date()
    const startDate = subDays(today, 29)
    const days = eachDayOfInterval({ start: startDate, end: today })

    let cumulativeR = 0

    return days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayTrades = trades.filter(
        (t) => format(new Date(t.tradeDate), 'yyyy-MM-dd') <= dayStr
      )

      cumulativeR = dayTrades.reduce(
        (sum, t) => sum + Number(t.actualRMultiple),
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
      { name: '獲利', value: wins, fill: 'hsl(142.1 76.2% 36.3%)' },
      { name: '虧損', value: losses, fill: 'hsl(0 84.2% 60.2%)' },
      { name: '平手', value: breakevens, fill: 'hsl(215.4 16.3% 46.9%)' }
    ].filter((item) => item.value > 0)
  }

  // 3. 計算 Long/Short 表現
  const getTradeTypeData = () => {
    const longTrades = trades.filter((t) => t.tradeTypeId?.includes('long'))
    const shortTrades = trades.filter((t) => t.tradeTypeId?.includes('short'))

    const longR = longTrades.reduce(
      (sum, t) => sum + Number(t.actualRMultiple),
      0
    )
    const shortR = shortTrades.reduce(
      (sum, t) => sum + Number(t.actualRMultiple),
      0
    )

    return [
      {
        type: 'Long',
        累積R: parseFloat(longR.toFixed(2)),
        fill: 'var(--color-long)'
      },
      {
        type: 'Short',
        累積R: parseFloat(shortR.toFixed(2)),
        fill: 'var(--color-short)'
      }
    ].filter((item) => longTrades.length > 0 || shortTrades.length > 0)
  }

  // 4. 最佳/最差商品
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
        totalR: existing.totalR + Number(t.actualRMultiple),
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

    return {
      top: sorted.slice(0, 3),
      bottom: sorted.slice(-3).reverse()
    }
  }

  const last30DaysData = getLast30DaysData()
  const winLossData = getWinLossData()
  const tradeTypeData = getTradeTypeData()
  const { top: topCommodities, bottom: bottomCommodities } = getTopCommodities()

  // 計算整體趨勢
  const totalR = trades.reduce((sum, t) => sum + Number(t.actualRMultiple), 0)
  const isPositive = totalR > 0

  // Chart 配置
  const areaChartConfig = {
    累積R: {
      label: '累積 R 倍數',
      color: isPositive ? 'hsl(142.1 76.2% 36.3%)' : 'hsl(0 84.2% 60.2%)'
    }
  } satisfies ChartConfig

  const tradeTypeChartConfig = {
    long: {
      label: 'Long',
      color: 'hsl(221.2 83.2% 53.3%)'
    },
    short: {
      label: 'Short',
      color: 'hsl(24.6 95% 53.1%)'
    }
  } satisfies ChartConfig

  return (
    <div className='space-y-6'>
      {/* 績效趨勢圖 */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>最近 30 天績效趨勢</CardTitle>
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
            <AreaChart data={last30DaysData}>
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

      {/* 勝率分析與交易類型 */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* 勝敗分布 */}
        <Card>
          <CardHeader>
            <CardTitle>勝敗分布</CardTitle>
          </CardHeader>
          <CardContent className='flex items-center justify-center'>
            <div className='h-[200px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    dataKey='value'
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Long/Short 表現 */}
        {tradeTypeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>交易類型表現</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={tradeTypeChartConfig}
                className='h-[200px] w-full'
              >
                <BarChart data={tradeTypeData}>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} />
                  <XAxis
                    dataKey='type'
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey='累積R' radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 商品表現排行 */}
      {topCommodities.length > 0 && (
        <div className='grid gap-6 md:grid-cols-2'>
          {/* 表現最佳 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Award className='h-5 w-5 text-yellow-500' />
                表現最佳商品
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {topCommodities.map((item, index) => (
                  <div
                    key={item.name}
                    className='flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 font-bold text-sm'>
                        {index + 1}
                      </div>
                      <div>
                        <div className='font-medium'>{item.name}</div>
                        <div className='text-xs text-muted-foreground'>
                          {item.count} 筆交易
                        </div>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='font-semibold text-green-500'>
                        {item.totalR > 0 ? '+' : ''}
                        {item.totalR}R
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        ${item.totalAmount > 0 ? '+' : ''}
                        {item.totalAmount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 需要改進 */}
          {bottomCommodities.length > 0 && bottomCommodities[0].totalR < 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <AlertCircle className='h-5 w-5 text-orange-500' />
                  需要改進商品
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {bottomCommodities.map((item, index) => (
                    <div
                      key={item.name}
                      className='flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-500 font-bold text-sm'>
                          {index + 1}
                        </div>
                        <div>
                          <div className='font-medium'>{item.name}</div>
                          <div className='text-xs text-muted-foreground'>
                            {item.count} 筆交易
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='font-semibold text-red-500'>
                          {item.totalR > 0 ? '+' : ''}
                          {item.totalR}R
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          ${item.totalAmount > 0 ? '+' : ''}
                          {item.totalAmount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
