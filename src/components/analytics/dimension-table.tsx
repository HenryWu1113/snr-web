/**
 * 統計分析維度表格組件
 */

'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DimensionStats } from '@/lib/stats'
import { ArrowUpCircle, ArrowDownCircle, MinusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsDimensionTableProps {
  title: string
  stats: DimensionStats[]
  showAmount?: boolean // 是否顯示金額欄位
}

export function AnalyticsDimensionTable({
  title,
  stats,
  showAmount = true,
}: AnalyticsDimensionTableProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名稱</TableHead>
                <TableHead className="text-center">交易次數</TableHead>
                <TableHead className="text-center">勝率</TableHead>
                <TableHead className="text-center">平均 RR Achieved</TableHead>
                <TableHead className="text-center">平均 Target RR</TableHead>
                <TableHead className="text-center">總 R 倍數</TableHead>
                {showAmount && (
                  <>
                    <TableHead className="text-right">總損益</TableHead>
                    <TableHead className="text-right">平均損益</TableHead>
                  </>
                )}
                <TableHead className="text-center">最佳/最差</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => {
                const isProfit = stat.totalRMultiple > 0
                const isLoss = stat.totalRMultiple < 0

                return (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">{stat.name}</TableCell>
                    <TableCell className="text-center">
                      {stat.totalTrades}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({stat.winningTrades}勝/{stat.losingTrades}敗)
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          'font-medium',
                          stat.winRate >= 50 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {stat.winRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          'font-medium',
                          stat.avgRMultiple > 0
                            ? 'text-green-600'
                            : stat.avgRMultiple < 0
                            ? 'text-red-600'
                            : 'text-gray-500'
                        )}
                      >
                        {stat.avgRMultiple > 0 ? '+' : ''}
                        {stat.avgRMultiple.toFixed(2)}R
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.avgTargetR.toFixed(2)}R
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isProfit ? (
                          <ArrowUpCircle className="h-4 w-4 text-green-600" />
                        ) : isLoss ? (
                          <ArrowDownCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <MinusCircle className="h-4 w-4 text-gray-500" />
                        )}
                        <span
                          className={cn(
                            'font-bold',
                            isProfit
                              ? 'text-green-600'
                              : isLoss
                              ? 'text-red-600'
                              : 'text-gray-500'
                          )}
                        >
                          {stat.totalRMultiple > 0 ? '+' : ''}
                          {stat.totalRMultiple.toFixed(2)}R
                        </span>
                      </div>
                    </TableCell>
                    {showAmount && (
                      <>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              'font-medium',
                              stat.totalProfitLoss > 0
                                ? 'text-green-600'
                                : stat.totalProfitLoss < 0
                                ? 'text-red-600'
                                : 'text-gray-500'
                            )}
                          >
                            ${stat.totalProfitLoss.toFixed(0)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-muted-foreground">
                            ${stat.avgProfitLoss.toFixed(0)}
                          </span>
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-green-600">
                          +{stat.bestTrade.toFixed(2)}R
                        </span>
                        <span className="text-xs text-red-600">
                          {stat.worstTrade.toFixed(2)}R
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
