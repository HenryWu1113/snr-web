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
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { CalendarIcon, Search, RotateCcw, X } from 'lucide-react'
import type { TradeFilters } from '@/types/datatable'
import type { DateRange } from 'react-day-picker'
import { useAllTradeOptions } from '@/hooks/use-trade-options-query'

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

  // 載入選項資料 (使用 React Query 快取)
  const { options } = useAllTradeOptions()

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
    // ⚡ 自動調換最小值和最大值（如果輸入順序錯誤）
    const correctedFilters = { ...localFilters }

    // 持倉時間
    if (
      correctedFilters.holdingTimeMin !== undefined &&
      correctedFilters.holdingTimeMax !== undefined &&
      correctedFilters.holdingTimeMin > correctedFilters.holdingTimeMax
    ) {
      const temp = correctedFilters.holdingTimeMin
      correctedFilters.holdingTimeMin = correctedFilters.holdingTimeMax
      correctedFilters.holdingTimeMax = temp
    }

    // R 倍數範圍
    if (
      correctedFilters.actualExitRMin !== undefined &&
      correctedFilters.actualExitRMax !== undefined &&
      correctedFilters.actualExitRMin > correctedFilters.actualExitRMax
    ) {
      const temp = correctedFilters.actualExitRMin
      correctedFilters.actualExitRMin = correctedFilters.actualExitRMax
      correctedFilters.actualExitRMax = temp
    }

    // 更新本地狀態（讓 UI 顯示正確的值）
    setLocalFilters(correctedFilters)
    onFiltersChange(correctedFilters)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* 第一行：日期與基本屬性 */}
          
          {/* 日期區間 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">交易日(圖表日期)</Label>
            <div className="flex gap-1">
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left font-normal h-9">
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
              {dateRange?.from && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => handleDateRangeChange(undefined)}
                  title="清空"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* 下單日區間 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">下單日</Label>
            <div className="flex gap-1">
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left font-normal h-9">
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
              {orderDateRange?.from && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => handleOrderDateRangeChange(undefined)}
                  title="清空"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
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

          {/* 交易時段 */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">交易時段</Label>
            <Select
              value={localFilters.tradingSession || 'all'}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  tradingSession: value === 'all' ? undefined : value as 'ASIAN' | 'LONDON' | 'NEWYORK' | 'OVERLAP',
                }))
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="ASIAN">亞洲盤</SelectItem>
                <SelectItem value="LONDON">倫敦盤</SelectItem>
                <SelectItem value="NEWYORK">紐約盤</SelectItem>
                <SelectItem value="OVERLAP">重疊時段</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 持倉時間（分鐘）*/}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">持倉時間（分鐘）</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="最小"
                className="h-9"
                value={localFilters.holdingTimeMin ?? ''}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    holdingTimeMin: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="最大"
                className="h-9"
                value={localFilters.holdingTimeMax ?? ''}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    holdingTimeMax: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
              {(localFilters.holdingTimeMin !== undefined || localFilters.holdingTimeMax !== undefined) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      holdingTimeMin: undefined,
                      holdingTimeMax: undefined,
                    }))
                  }
                  title="清空"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* 第四行：數值與搜尋 */}

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
              {(localFilters.actualExitRMin !== undefined || localFilters.actualExitRMax !== undefined) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      actualExitRMin: undefined,
                      actualExitRMax: undefined,
                    }))
                  }
                  title="清空"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* 備註文字搜尋 */}
          <div className="space-y-2 md:col-span-2 lg:col-span-1 xl:col-span-1">
            <Label className="text-xs font-semibold text-muted-foreground">備註文字搜尋</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋備註..."
                className="pl-8 pr-8 h-9"
                value={localFilters.keyword ?? ''}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    keyword: e.target.value || undefined,
                  }))
                }
              />
              {localFilters.keyword && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      keyword: undefined,
                    }))
                  }
                  title="清空"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* 進場模式（多選）*/}
          <div className="space-y-2 col-span-full">
            <Label className="text-xs font-semibold text-muted-foreground">進場模式（可多選）</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-2 border rounded-md bg-muted/30">
              {options.entryTypes.length > 0 ? (
                options.entryTypes.map((opt) => (
                  <div key={opt.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`entry-${opt.id}`}
                      checked={localFilters.entryTypeIds?.includes(opt.id) || false}
                      onCheckedChange={(checked) => {
                        const current = localFilters.entryTypeIds || []
                        setLocalFilters((prev) => ({
                          ...prev,
                          entryTypeIds: checked
                            ? [...current, opt.id]
                            : current.filter((id) => id !== opt.id),
                        }))
                      }}
                    />
                    <label
                      htmlFor={`entry-${opt.id}`}
                      className="text-sm cursor-pointer select-none leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {opt.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground col-span-full text-center py-1">
                  無選項
                </p>
              )}
            </div>
          </div>

          {/* 自定義標籤（多選）*/}
          <div className="space-y-2 col-span-full">
            <Label className="text-xs font-semibold text-muted-foreground">自定義標籤（可多選）</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-2 border rounded-md bg-muted/30">
              {options.tradingTags.length > 0 ? (
                options.tradingTags.map((opt) => (
                  <div key={opt.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${opt.id}`}
                      checked={localFilters.tagIds?.includes(opt.id) || false}
                      onCheckedChange={(checked) => {
                        const current = localFilters.tagIds || []
                        setLocalFilters((prev) => ({
                          ...prev,
                          tagIds: checked
                            ? [...current, opt.id]
                            : current.filter((id) => id !== opt.id),
                        }))
                      }}
                    />
                    <label
                      htmlFor={`tag-${opt.id}`}
                      className="text-sm cursor-pointer select-none leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {opt.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground col-span-full text-center py-1">
                  無標籤
                </p>
              )}
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
