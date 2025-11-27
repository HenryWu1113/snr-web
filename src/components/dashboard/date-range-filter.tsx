'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'

export type TimeRange = 'today' | 'week' | 'month' | 'all' | 'custom'

interface DateRangeFilterProps {
  selectedRange: TimeRange
  onRangeChange: (range: TimeRange) => void
  customDateRange?: DateRange
  onCustomDateChange?: (range: DateRange | undefined) => void
}

export function DateRangeFilter({
  selectedRange,
  onRangeChange,
  customDateRange,
  onCustomDateChange,
}: DateRangeFilterProps) {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: 'today', label: '今日' },
    { value: 'week', label: '本週' },
    { value: 'month', label: '本月' },
    { value: 'all', label: '全部' },
    { value: 'custom', label: '自訂' },
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={selectedRange === range.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onRangeChange(range.value)}
        >
          {range.label}
        </Button>
      ))}

      {selectedRange === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'justify-start text-left font-normal',
                !customDateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customDateRange?.from ? (
                customDateRange.to ? (
                  <>
                    {format(customDateRange.from, 'yyyy/MM/dd', {
                      locale: zhTW,
                    })}{' '}
                    -{' '}
                    {format(customDateRange.to, 'yyyy/MM/dd', { locale: zhTW })}
                  </>
                ) : (
                  format(customDateRange.from, 'yyyy/MM/dd', { locale: zhTW })
                )
              ) : (
                '選擇日期範圍'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={customDateRange?.from}
              selected={customDateRange}
              onSelect={onCustomDateChange}
              numberOfMonths={2}
              locale={zhTW}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
