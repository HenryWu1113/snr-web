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
import { CalendarIcon, Search, RotateCcw } from 'lucide-react'
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
  const [orderDateRange, setOrderDateRange] = useState<DateRange | undefined>({
    from: filters.orderDateFrom ? new Date(filters.orderDateFrom) : undefined,
    to: filters.orderDateTo ? new Date(filters.orderDateTo) : undefined,
  })

  // 載入選項資料
  const [options, setOptions] = useState<{
    tradeTypes: Array<{ id: string; name: string }>
    commodities: Array<{ id: string; name: string }>
    timeframes: Array<{ id: string; name: string }>
    entryTypes: Array<{ id: string; name: string }>
    trendlineTypes: Array<{ id: string; name: string }>
  }>({
    tradeTypes: [],
    commodities: [],
    timeframes: [],
    entryTypes: [],
    trendlineTypes: [],
  })

  useEffect(() => {
    async function loadOptions() {
      try {
        const [tradeTypes, commodities, timeframes, entryTypes, trendlineTypes] = await Promise.all([
          fetch('/api/options/trade-types').then(r => r.json()).then(res => res.data || []),
          fetch('/api/options/commodities').then(r => r.json()).then(res => res.data || []),
          fetch('/api/options/timeframes').then(r => r.json()).then(res => res.data || []),
          fetch('/api/options/entry-types').then(r => r.json()).then(res => res.data || []),
          fetch('/api/options/trendline-types').then(r => r.json()).then(res => res.data || []),
        ])
        setOptions({ 
          tradeTypes: Array.isArray(tradeTypes) ? tradeTypes : [],
          commodities: Array.isArray(commodities) ? commodities : [],
          timeframes: Array.isArray(timeframes) ? timeframes : [],
          entryTypes: Array.isArray(entryTypes) ? entryTypes : [],
          trendlineTypes: Array.isArray(trendlineTypes) ? trendlineTypes : []
        })
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
      dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
      dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
    }))
  }

  // 處理下單日期範圍變更
  const handleOrderDateRangeChange = (range: DateRange | undefined) => {
    setOrderDateRange(range)
    setLocalFilters((prev) => ({
      ...prev,
      orderDateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
      orderDateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
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
    setOrderDateRange(undefined)
    onFiltersChange(emptyFilters)
  }

  return (
    <Card className="border-dashed shadow-sm">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* 第一行：日期與基本屬性 */}
          
          {/* 日期區間 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">交易日(圖表日期)</Label>
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
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
                    <span className="text-muted-foreground">選擇日期範圍</span>
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

          {/* 下單日區間 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">下單日</Label>
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {orderDateRange?.from ? (
                    orderDateRange.to ? (
                      <>
                        {format(orderDateRange.from, 'yyyy/MM/dd', { locale: zhTW })} -{' '}
                        {format(orderDateRange.to, 'yyyy/MM/dd', { locale: zhTW })}
                      </>
                    ) : (
                      format(orderDateRange.from, 'yyyy/MM/dd', { locale: zhTW })
                    )
                  ) : (
                    <span className="text-muted-foreground">選擇日期範圍</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={orderDateRange?.from}
                  selected={orderDateRange}
                  onSelect={handleOrderDateRangeChange}
                  numberOfMonths={2}
                  locale={zhTW}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 交易類型 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">交易類型</Label>
            <Select
              value={localFilters.tradeTypeIds?.[0] || 'all'}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  tradeTypeIds: value === 'all' ? undefined : [value],
                }))
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {options.tradeTypes.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 商品 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">商品</Label>
            <Select
              value={localFilters.commodityIds?.[0] || 'all'}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  commodityIds: value === 'all' ? undefined : [value],
                }))
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {options.commodities.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 做多/做空 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">做多/做空</Label>
            <Select
              value={localFilters.positions?.[0] || 'all'}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  positions: value === 'all' ? undefined : [value as 'LONG' | 'SHORT'],
                }))
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="LONG">做多</SelectItem>
                <SelectItem value="SHORT">做空</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 第二行：技術分析屬性 */}

          {/* 時間框架 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">時間框架</Label>
            <Select
              value={localFilters.timeframeIds?.[0] || 'all'}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  timeframeIds: value === 'all' ? undefined : [value],
                }))
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {options.timeframes.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 進場模式 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">進場模式</Label>
            <Select
              value={localFilters.entryTypeIds?.[0] || 'all'}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  entryTypeIds: value === 'all' ? undefined : [value],
                }))
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {options.entryTypes.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 趨勢線 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">趨勢線</Label>
            <Select
              value={localFilters.trendlineTypeIds?.[0] || 'all'}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  trendlineTypeIds: value === 'all' ? undefined : [value],
                }))
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {options.trendlineTypes.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 交易結果 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">交易結果</Label>
            <Select
              value={localFilters.winLoss || 'all'}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  winLoss: value as 'win' | 'loss' | 'breakeven' | 'all',
                }))
              }
            >
              <SelectTrigger className="h-9 w-full">
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

          {/* 第三行：數值與搜尋 */}

          {/* R 倍數範圍 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">R 倍數範圍</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="最小"
                className="h-9"
                value={localFilters.actualExitRMin ?? ''}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    actualExitRMin: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                step="0.1"
                placeholder="最大"
                className="h-9"
                value={localFilters.actualExitRMax ?? ''}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    actualExitRMax: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>

          {/* 備註文字搜尋 */}
          <div className="space-y-2 md:col-span-2 lg:col-span-1 xl:col-span-1">
            <Label className="text-xs font-semibold text-muted-foreground">備註文字搜尋</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋備註..."
                className="pl-8 h-9"
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
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-9">
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            重置條件
          </Button>
          <Button size="sm" onClick={handleApply} className="h-9">
            套用篩選
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
