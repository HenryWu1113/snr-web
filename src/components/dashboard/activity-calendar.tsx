'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

type DateMode = 'tradeDate' | 'createdAt'
type ValueMode = 'r' | 'amount'

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

      const value =
        valueMode === 'r' ? data?.totalRMultiple || 0 : data?.totalProfitLoss || 0

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
  const getColorLevel = (value: number): number => {
    if (value === 0) return 0
    const absValue = Math.abs(value)
    if (absValue <= 0.5) return 1
    if (absValue <= 1) return 2
    if (absValue <= 2) return 3
    return 4
  }

  const getColorClass = (value: number, level: number): string => {
    if (level === 0) return 'bg-muted'

    const isProfit = value > 0
    const intensity = level * 200 + 100 // 100, 300, 500, 700, 900

    if (isProfit) {
      return `bg-green-${intensity} dark:bg-green-${intensity === 900 ? 800 : intensity}`
    } else {
      return `bg-red-${intensity} dark:bg-red-${intensity === 900 ? 800 : intensity}`
    }
  }

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'] // 從週日開始（配合 getDay() 的順序）

  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>交易活動</CardTitle>
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
                  const level = getColorLevel(day.value)
                  const isCurrentYear =
                    day.date >= yearStart && day.date <= yearEnd

                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        'h-4 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-ring',
                        isCurrentYear
                          ? getColorClass(day.value, level)
                          : 'bg-transparent'
                      )}
                      title={
                        day.count > 0
                          ? `${format(day.date, 'yyyy/MM/dd', { locale: zhTW })}\n${day.count} 筆交易\n${valueMode === 'r' ? 'R: ' + day.value.toFixed(2) : '金額: $' + day.value.toFixed(0)}`
                          : format(day.date, 'yyyy/MM/dd', { locale: zhTW })
                      }
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 圖例 */}
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground ml-10">
            <span>少</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-sm bg-muted" />
              <div className="w-4 h-4 rounded-sm bg-green-300 dark:bg-green-300" />
              <div className="w-4 h-4 rounded-sm bg-green-500 dark:bg-green-500" />
              <div className="w-4 h-4 rounded-sm bg-green-700 dark:bg-green-700" />
              <div className="w-4 h-4 rounded-sm bg-green-900 dark:bg-green-800" />
            </div>
            <span>多 (獲利)</span>
            <div className="flex gap-1 ml-4">
              <div className="w-4 h-4 rounded-sm bg-red-300 dark:bg-red-300" />
              <div className="w-4 h-4 rounded-sm bg-red-500 dark:bg-red-500" />
              <div className="w-4 h-4 rounded-sm bg-red-700 dark:bg-red-700" />
              <div className="w-4 h-4 rounded-sm bg-red-900 dark:bg-red-800" />
            </div>
            <span>(虧損)</span>
          </div>
      </CardContent>
    </Card>
  )
}
