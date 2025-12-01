/**
 * 維度分析通用內容組件（Client Component）
 */

'use client'

import { useState, useEffect } from 'react'
import { DimensionStats } from '@/lib/stats'
import { AnalyticsDimensionTable } from './dimension-table'
import { AnalyticsDimensionCharts } from './dimension-charts'
import { DateRangeSelector } from '@/components/dashboard/date-range-selector'
import { startOfMonth, endOfMonth } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DimensionAnalysisContentProps {
  dimension: 'commodity' | 'tradeType' | 'timeframe' | 'trendline' | 'position' | 'entryType' | 'tradingSession' | 'tags' | 'holdingTime'
  title: string
  description: string
}

export function DimensionAnalysisContent({
  dimension,
  title,
  description,
}: DimensionAnalysisContentProps) {
  const [stats, setStats] = useState<DimensionStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // 獲取統計數據
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          dimension,
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        })

        const response = await fetch(`/api/analytics?${params}`)

        if (!response.ok) {
          throw new Error('獲取統計數據失敗')
        }

        const data = await response.json()
        setStats(data.stats || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知錯誤')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [dimension, dateRange])

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/analytics">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <DateRangeSelector 
            onRangeChange={setDateRange}
            defaultPreset="custom"
            defaultCustomRange={dateRange}
          />
        </div>
      </header>

      {/* 載入中 */}
      {loading && (
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 統計數據 */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* 圖表 */}
          <AnalyticsDimensionCharts title={title} stats={stats} />

          {/* 表格 */}
          <AnalyticsDimensionTable title={`${title} - 詳細數據`} stats={stats} />
        </div>
      )}
    </>
  )
}
