'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DailyTradeData } from '@/lib/stats'
import { cn } from '@/lib/utils'
import {
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  format,
  getDay,
  startOfWeek,
  addDays,
} from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

type DateMode = 'tradeDate' | 'createdAt'
type ValueMode = 'r' | 'amount' | 'frequency'

interface ActivityCalendarProps {
  dailyData: Map<string, DailyTradeData>
  year?: number
  onYearChange?: (year: number) => void
}

export function ActivityCalendar({
  dailyData,
  year: initialYear = new Date().getFullYear(),
  onYearChange,
}: ActivityCalendarProps) {
  const [dateMode, setDateMode] = useState<DateMode>('tradeDate')
  const [valueMode, setValueMode] = useState<ValueMode>('r')
  const [selectedYear, setSelectedYear] = useState(initialYear)

  // 處理年份變更
  const handleYearChange = (newYear: string) => {
    const yearNum = parseInt(newYear)
    setSelectedYear(yearNum)
    onYearChange?.(yearNum)
  }

  // 生成一年的所有日期
  const yearStart = startOfYear(new Date(selectedYear, 0, 1))
  const yearEnd = endOfYear(new Date(selectedYear, 11, 31))
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd })

  // 計算需要的週數和開始日期
  const firstDayOfYear = getDay(yearStart)
  const startDate = addDays(startOfWeek(yearStart), 0)
  const totalWeeks = Math.ceil((allDays.length + firstDayOfYear) / 7)

  // 生成日曆格子數據
  const weeks = Array.from({ length: totalWeeks }, (_, weekIndex) => {
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(startDate, weekIndex * 7 + dayIndex)
      const dateString = format(date, 'yyyy-MM-dd')
      const data = dailyData.get(dateString)

      let value: number
      if (valueMode === 'frequency') {
        value = data?.tradeCount || 0
      } else {
        value = valueMode === 'r' ? data?.totalRMultiple || 0 : data?.totalProfitLoss || 0
      }

      return {
        date,
        dateString,
        data,
        value,
        count: data?.tradeCount || 0,
      }
    })
  })

  // 計算顏色等級 (0-4)
  const getColorLevel = (value: number, mode: ValueMode, hasTraded: boolean): number => {
    if (mode === 'frequency') {
      // 交易頻率：0, 1筆, 2筆, 3筆, 4筆+
      if (value === 0) return 0
      if (value === 1) return 1
      if (value === 2) return 2
      if (value === 3) return 3
      return 4
    }
    
    // R倍數和金額
    // 沒有交易：返回 -1（特殊標記）
    if (!hasTraded) return -1
    
    // 有交易但打平
    if (value === 0) return 0
    
    const absValue = Math.abs(value)
    
    if (mode === 'r') {
      // R倍數分級
      if (absValue <= 1) return 1      // 0.01-1R
      if (absValue <= 2) return 2      // 1.01-2R
      if (absValue <= 3) return 3      // 2.01-3R
      return 4                         // 3.01R+
    } else {
      // 金額分級 (不變)
      if (absValue <= 250) return 1
      if (absValue <= 500) return 2
      if (absValue <= 1000) return 3
      return 4
    }
  }

  const getColorClass = (value: number, level: number, mode: ValueMode): string => {
    // 交易頻率模式：藍色漸變
    if (mode === 'frequency') {
      if (level === 0) return 'bg-muted dark:bg-muted'
      const blueShades = [
        'bg-blue-200 dark:bg-blue-900',
        'bg-blue-400 dark:bg-blue-700',
        'bg-blue-600 dark:bg-blue-600',
        'bg-blue-800 dark:bg-blue-500',
      ]
      return blueShades[level - 1]
    }

    // 沒有交易：bg-muted
    if (level === -1) {
      return 'bg-muted dark:bg-muted'
    }

    // 有交易但打平：灰色
    if (level === 0) {
      return 'bg-gray-300 dark:bg-gray-600'
    }

    // R倍數和金額模式：綠色(獲利)/紅色(虧損)
    const isProfit = value > 0
    
    if (isProfit) {
      const greenShades = [
        'bg-green-200 dark:bg-green-900',
        'bg-green-400 dark:bg-green-700',
        'bg-green-600 dark:bg-green-600',
        'bg-green-800 dark:bg-green-500',
      ]
      return greenShades[level - 1]
    } else {
      const redShades = [
        'bg-red-200 dark:bg-red-900',
        'bg-red-400 dark:bg-red-700',
        'bg-red-600 dark:bg-red-600',
        'bg-red-800 dark:bg-red-500',
      ]
      return redShades[level - 1]
    }
  }

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']

  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  // 顏色規則說明
  const getColorRulesContent = () => {
    if (valueMode === 'frequency') {
      return (
        <div className="space-y-2 text-xs">
          <div className="font-semibold mb-2">交易頻率分級</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-muted dark:bg-muted" />
            <span>0 筆</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900" />
            <span>1 筆</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-700" />
            <span>2 筆</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-600 dark:bg-blue-600" />
            <span>3 筆</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-800 dark:bg-blue-500" />
            <span>4+ 筆</span>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3 text-xs">
        <div className="font-semibold mb-2">{valueMode === 'r' ? 'R 倍數分級' : '金額分級'}</div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-muted dark:bg-muted" />
            <span>無交易</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-600" />
            <span>打平 (有交易但 {valueMode === 'r' ? 'R' : '金額'} = 0)</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium text-green-600 dark:text-green-400">獲利</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
            <span>{valueMode === 'r' ? '0.01-1R' : '$1-$250'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
            <span>{valueMode === 'r' ? '1.01-2R' : '$251-$500'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-600" />
            <span>{valueMode === 'r' ? '2.01-3R' : '$501-$1000'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-500" />
            <span>{valueMode === 'r' ? '3.01R+' : '$1001+'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium text-red-600 dark:text-red-400">虧損</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-200 dark:bg-red-900" />
            <span>{valueMode === 'r' ? '-0.01~-1R' : '-$1~-$250'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-400 dark:bg-red-700" />
            <span>{valueMode === 'r' ? '-1.01~-2R' : '-$251~-$500'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-600 dark:bg-red-600" />
            <span>{valueMode === 'r' ? '-2.01~-3R' : '-$501~-$1000'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-800 dark:bg-red-500" />
            <span>{valueMode === 'r' ? '-3.01R-' : '-$1001-'}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>交易活動</CardTitle>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  {getColorRulesContent()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateMode} onValueChange={(v) => setDateMode(v as DateMode)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tradeDate">交易日期</SelectItem>
                <SelectItem value="createdAt">記錄日期</SelectItem>
              </SelectContent>
            </Select>

            <Select value={valueMode} onValueChange={(v) => setValueMode(v as ValueMode)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="r">R 倍數</SelectItem>
                <SelectItem value="amount">金額</SelectItem>
                <SelectItem value="frequency">交易頻率</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 月份標籤 */}
        <div className="flex gap-[3px] mb-2 ml-10">
          {months.map((month, i) => (
            <div
              key={i}
              className="text-xs text-muted-foreground text-center flex-1"
            >
              {month}
            </div>
          ))}
        </div>

        <TooltipProvider delayDuration={0}>
          {/* 日曆格子 */}
          <div className="flex gap-[3px]">
            {/* 星期標籤 */}
            <div className="flex flex-col gap-[3px] w-10">
              {weekdays.map((day, index) => (
                <div
                  key={index}
                  className="h-4 flex items-center justify-end pr-2 text-xs text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 週格子容器 */}
            <div className="flex gap-[3px] flex-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px] flex-1">
                  {week.map((day, dayIndex) => {
                    const level = getColorLevel(day.value, valueMode, day.count > 0)
                    const isCurrentYear =
                      day.date >= yearStart && day.date <= yearEnd

                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'h-4 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-ring',
                              isCurrentYear
                                ? getColorClass(day.value, level, valueMode)
                                : 'bg-transparent'
                            )}
                          />
                        </TooltipTrigger>
                        {day.count > 0 ? (
                          <TooltipContent side="top" className="text-xs">
                            <div className="space-y-1">
                              <div className="font-semibold">
                                {format(day.date, 'yyyy/MM/dd', { locale: zhTW })}
                              </div>
                              <div>{day.count} 筆交易</div>
                              {valueMode === 'frequency' ? (
                                <div className="text-muted-foreground">
                                  交易頻率: {day.count}
                                </div>
                              ) : (
                                <div className="text-muted-foreground">
                                  {valueMode === 'r' 
                                    ? `R: ${day.value > 0 ? '+' : ''}${day.value.toFixed(2)}` 
                                    : `金額: ${day.value > 0 ? '+$' : '$'}${day.value.toFixed(0)}`}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        ) : (
                          <TooltipContent side="top" className="text-xs">
                            {format(day.date, 'yyyy/MM/dd', { locale: zhTW })}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>

        {/* 圖例 */}
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground ml-10">
          <span>少</span>
          <div className="flex gap-1">
            {valueMode === 'frequency' ? (
              <>
                <div className="w-4 h-4 rounded-sm bg-muted dark:bg-muted" title="0 筆" />
                <div className="w-4 h-4 rounded-sm bg-blue-200 dark:bg-blue-900" title="1 筆" />
                <div className="w-4 h-4 rounded-sm bg-blue-400 dark:bg-blue-700" title="2 筆" />
                <div className="w-4 h-4 rounded-sm bg-blue-600 dark:bg-blue-600" title="3 筆" />
                <div className="w-4 h-4 rounded-sm bg-blue-800 dark:bg-blue-500" title="4+ 筆" />
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-sm bg-muted dark:bg-muted" title="無交易" />
                <div className="w-4 h-4 rounded-sm bg-gray-300 dark:bg-gray-600" title="打平" />
                <div className="w-4 h-4 rounded-sm bg-green-200 dark:bg-green-900" title={valueMode === 'r' ? '0.01-1R' : '≤$250'} />
                <div className="w-4 h-4 rounded-sm bg-green-400 dark:bg-green-700" title={valueMode === 'r' ? '1.01-2R' : '≤$500'} />
                <div className="w-4 h-4 rounded-sm bg-green-600 dark:bg-green-600" title={valueMode === 'r' ? '2.01-3R' : '≤$1000'} />
                <div className="w-4 h-4 rounded-sm bg-green-800 dark:bg-green-500" title={valueMode === 'r' ? '3.01R+' : '>$1000'} />
              </>
            )}
          </div>
          {valueMode === 'frequency' ? (
            <span>多 (頻率)</span>
          ) : (
            <>
              <span>多 (獲利)</span>
              <div className="flex gap-1 ml-4">
                <div className="w-4 h-4 rounded-sm bg-red-200 dark:bg-red-900" title={valueMode === 'r' ? '-0.01~-1R' : '≤-$250'} />
                <div className="w-4 h-4 rounded-sm bg-red-400 dark:bg-red-700" title={valueMode === 'r' ? '-1.01~-2R' : '≤-$500'} />
                <div className="w-4 h-4 rounded-sm bg-red-600 dark:bg-red-600" title={valueMode === 'r' ? '-2.01~-3R' : '≤-$1000'} />
                <div className="w-4 h-4 rounded-sm bg-red-800 dark:bg-red-500" title={valueMode === 'r' ? '-3.01R-' : '<-$1000'} />
              </div>
              <span>(虧損)</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
