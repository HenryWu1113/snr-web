/**
 * 統計分析維度圖表組件
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
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
} from 'recharts'
import { DimensionStats } from '@/lib/stats'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AnalyticsDimensionChartsProps {
  title: string
  stats: DimensionStats[]
}

const COLORS = [
  'hsl(199 89% 48%)', // sky-500
  'hsl(271 81% 56%)', // violet-500
  'hsl(37 91% 55%)', // amber-500
  'hsl(158 64% 52%)', // emerald-500
  'hsl(340 82% 52%)', // rose-500
  'hsl(243 75% 59%)', // indigo-500
  'hsl(187 92% 41%)', // cyan-500
  'hsl(24 95% 53%)', // orange-500
]

export function AnalyticsDimensionCharts({
  title,
  stats,
}: AnalyticsDimensionChartsProps) {
  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">暫無數據</p>
        </CardContent>
      </Card>
    )
  }

  // 準備圓餅圖數據（交易次數分布）
  const pieData = stats.map((stat, index) => ({
    name: stat.name,
    value: stat.totalTrades,
    fill: COLORS[index % COLORS.length],
  }))

  // 準備柱狀圖數據（勝率比較）
  const winRateData = stats.map((stat, index) => ({
    name: stat.name,
    勝率: parseFloat(stat.winRate.toFixed(1)),
    fill: stat.winRate >= 50 ? '#10b981' : '#f43f5e', // emerald-500 : rose-500
  }))

  // 準備 R 倍數柱狀圖數據
  const rMultipleData = stats.map((stat) => ({
    name: stat.name,
    總R倍數: parseFloat(stat.totalRMultiple.toFixed(2)),
    平均R倍數: parseFloat(stat.avgRMultiple.toFixed(2)),
  }))

  // 準備損益柱狀圖數據
  const profitLossData = stats.map((stat) => ({
    name: stat.name,
    總損益: parseFloat(stat.totalProfitLoss.toFixed(0)),
    平均損益: parseFloat(stat.avgProfitLoss.toFixed(0)),
  }))

  const chartConfig = {
    勝率: {
      label: '勝率 (%)',
      color: '#10b981',
    },
    總R倍數: {
      label: '總 R 倍數',
      color: '#0ea5e9', // sky-500
    },
    平均R倍數: {
      label: '平均 R 倍數',
      color: '#8b5cf6', // violet-500
    },
    總損益: {
      label: '總損益',
      color: '#0ea5e9', // sky-500
    },
    平均損益: {
      label: '平均損益',
      color: '#8b5cf6', // violet-500
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} - 視覺化分析</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="winrate" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger 
              value="winrate"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
            >
              勝率
            </TabsTrigger>
            <TabsTrigger 
              value="rmultiple"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
            >
              R 倍數
            </TabsTrigger>
            <TabsTrigger 
              value="profitloss"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
            >
              損益
            </TabsTrigger>
            <TabsTrigger 
              value="distribution"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
            >
              分布
            </TabsTrigger>
          </TabsList>

          {/* 勝率柱狀圖 */}
          <TabsContent value="winrate" className="mt-6">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <BarChart data={winRateData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="勝率" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </TabsContent>

          {/* R 倍數柱狀圖 */}
          <TabsContent value="rmultiple" className="mt-6">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <BarChart data={rMultipleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="總R倍數"
                  fill="#0ea5e9"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="平均R倍數"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>

          {/* 損益柱狀圖 */}
          <TabsContent value="profitloss" className="mt-6">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <BarChart data={profitLossData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="總損益"
                  fill="#0ea5e9"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="平均損益"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>

          {/* 圓餅圖 - 交易次數分布 */}
          <TabsContent value="distribution" className="mt-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {payload[0].name}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 font-mono text-sm font-bold">
                                <span>{payload[0].value} 筆交易</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
