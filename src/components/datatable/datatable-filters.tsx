/**
 * DataTable 篩選器組件
 * 支援日期區間、多選、數值範圍等篩選條件
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { CalendarIcon, Search } from 'lucide-react'
import type { TradeFilters } from '@/types/datatable'
import type { DateRange } from 'react-day-picker'

interface DataTableFiltersProps {
  filters: TradeFilters
  onFiltersChange: (filters: TradeFilters) => void
}

export function DataTableFilters({ filters, onFiltersChange }: DataTableFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TradeFilters>(filters)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
    to: filters.dateTo ? new Date(filters.dateTo) : undefined,
  })

  // 載入選項資料（商品、時間框架等）
  const [options, setOptions] = useState<{
    commodities: Array<{ id: string; name: string }>
    timeframes: Array<{ id: string; name: string }>
    entryTypes: Array<{ id: string; name: string }>
    trendlineTypes: Array<{ id: string; name: string }>
  }>({
    commodities: [],
    timeframes: [],
    entryTypes: [],
    trendlineTypes: [],
  })

  useEffect(() => {
    // TODO: 從 API 載入選項資料
    // 這裡先使用空陣列，之後需要實作 API
    async function loadOptions() {
      try {
        // const [commodities, timeframes, entryTypes, trendlineTypes] = await Promise.all([
        //   fetch('/api/options/commodities').then(r => r.json()),
        //   fetch('/api/options/timeframes').then(r => r.json()),
        //   fetch('/api/options/entry-types').then(r => r.json()),
        //   fetch('/api/options/trendline-types').then(r => r.json()),
        // ])
        // setOptions({ commodities, timeframes, entryTypes, trendlineTypes })
      } catch (error) {
        console.error('Failed to load options:', error)
      }
    }
    loadOptions()
  }, [])

  // 處理日期範圍變更
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    setLocalFilters((prev) => ({
      ...prev,
      dateFrom: range?.from ? range.from.toISOString() : undefined,
      dateTo: range?.to ? range.to.toISOString() : undefined,
    }))
  }

  // 套用篩選
  const handleApply = () => {
    onFiltersChange(localFilters)
  }

  // 重置篩選
  const handleReset = () => {
    const emptyFilters: TradeFilters = {}
    setLocalFilters(emptyFilters)
    setDateRange(undefined)
    onFiltersChange(emptyFilters)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* 日期區間 */}
          <div className="space-y-2">
            <Label>交易日期</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'yyyy/MM/dd', { locale: zhTW })} -{' '}
                        {format(dateRange.to, 'yyyy/MM/dd', { locale: zhTW })}
                      </>
                    ) : (
                      format(dateRange.from, 'yyyy/MM/dd', { locale: zhTW })
                    )
                  ) : (
                    <span>選擇日期範圍</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  locale={zhTW}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 勝敗篩選 */}
          <div className="space-y-2">
            <Label>交易結果</Label>
            <Select
              value={localFilters.winLoss || 'all'}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  winLoss: value as 'win' | 'loss' | 'breakeven' | 'all',
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="win">獲勝</SelectItem>
                <SelectItem value="loss">虧損</SelectItem>
                <SelectItem value="breakeven">平手</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* R 倍數範圍 */}
          <div className="space-y-2">
            <Label>R 倍數範圍</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="最小"
                value={localFilters.actualRMultipleMin ?? ''}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    actualRMultipleMin: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
              <span>~</span>
              <Input
                type="number"
                step="0.1"
                placeholder="最大"
                value={localFilters.actualRMultipleMax ?? ''}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    actualRMultipleMax: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>

          {/* 關鍵字搜尋 */}
          <div className="space-y-2">
            <Label>關鍵字搜尋</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋備註..."
                className="pl-8"
                value={localFilters.keyword ?? ''}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    keyword: e.target.value || undefined,
                  }))
                }
              />
            </div>
          </div>

          {/* TODO: 多選篩選器（商品、時間框架等） */}
          {/* 這些需要實作 multi-select 組件 */}
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
          <Button onClick={handleApply}>套用篩選</Button>
        </div>
      </CardContent>
    </Card>
  )
}
