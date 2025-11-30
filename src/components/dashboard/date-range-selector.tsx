/**
 * 時間區間選擇器組件
 */

'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  endOfDay
} from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'

export type DateRangePreset =
  | 'thisWeek'
  | 'thisMonth'
  | 'thisQuarter'
  | 'thisYear'
  | 'custom'

interface DateRangeSelectorProps {
  onRangeChange: (range: { from: Date; to: Date }) => void
  defaultPreset?: DateRangePreset
  defaultCustomRange?: DateRange
}

export function DateRangeSelector({ 
  onRangeChange,
  defaultPreset = 'thisWeek',
  defaultCustomRange
}: DateRangeSelectorProps) {
  const [preset, setPreset] = useState<DateRangePreset>(defaultPreset)
  // 自定義區間預設為最近30天，或傳入的預設值
  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    defaultCustomRange || {
      from: subDays(new Date(), 29),
      to: new Date()
    }
  )

  // 計算預設時間範圍
  const getDateRange = (
    presetValue: DateRangePreset
  ): { from: Date; to: Date } => {
    const today = new Date()

    switch (presetValue) {
      case 'thisWeek':
        return {
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 })
        }
      case 'thisMonth':
        return { from: startOfMonth(today), to: endOfMonth(today) }
      case 'thisQuarter':
        return { from: startOfQuarter(today), to: endOfQuarter(today) }
      case 'thisYear':
        return { from: startOfYear(today), to: endOfYear(today) }
      case 'custom':
        return customRange?.from && customRange?.to
          ? { from: customRange.from, to: endOfDay(customRange.to) }
          : { from: subDays(today, 29), to: endOfDay(today) }
      default:
        return {
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 })
        }
    }
  }

  // 處理預設值變更
  const handlePresetChange = (value: DateRangePreset) => {
    setPreset(value)
    const range = getDateRange(value)
    // 如果切換到自訂區間且沒有完整日期，則不觸發變更（等待使用者選擇）
    if (value === 'custom' && (!customRange?.from || !customRange?.to)) {
      return
    }
    onRangeChange(range)
  }

  // 處理自訂區間變更
  const handleCustomRangeChange = (range: DateRange | undefined) => {
    setCustomRange(range)
    if (range?.from && range?.to) {
      onRangeChange({ from: range.from, to: endOfDay(range.to) })
    }
  }

  const currentRange = getDateRange(preset)

  return (
    <div className='flex items-center gap-3'>
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className='w-[160px]'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='thisWeek'>本週</SelectItem>
          <SelectItem value='thisMonth'>本月</SelectItem>
          <SelectItem value='thisQuarter'>本季</SelectItem>
          <SelectItem value='thisYear'>本年</SelectItem>
          <SelectItem value='custom'>自訂區間</SelectItem>
        </SelectContent>
      </Select>

      {preset === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-[280px] justify-start text-left font-normal',
                !customRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {customRange?.from ? (
                customRange.to ? (
                  <>
                    {format(customRange.from, 'yyyy/MM/dd', { locale: zhTW })} -{' '}
                    {format(customRange.to, 'yyyy/MM/dd', { locale: zhTW })}
                  </>
                ) : (
                  format(customRange.from, 'yyyy/MM/dd', { locale: zhTW })
                )
              ) : (
                <span>選擇日期區間</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='range'
              selected={customRange}
              onSelect={handleCustomRangeChange}
              numberOfMonths={2}
              locale={zhTW}
            />
          </PopoverContent>
        </Popover>
      )}

      {preset !== 'custom' && (
        <span className='text-sm text-muted-foreground'>
          {format(currentRange.from, 'yyyy/MM/dd')} -{' '}
          {format(currentRange.to, 'yyyy/MM/dd')}
        </span>
      )}
    </div>
  )
}
