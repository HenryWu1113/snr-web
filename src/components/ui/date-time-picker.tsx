/**
 * 自定義日期時間選擇器組件
 * 用於替代原生的 datetime-local input，解決 iPad 跑版問題
 */

'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface DateTimePickerProps {
  value?: Date
  onChange: (date: Date) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = '選擇日期和時間',
  disabled = false,
  className
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value)
  const [hours, setHours] = useState(
    value ? value.getHours().toString().padStart(2, '0') : '00'
  )
  const [minutes, setMinutes] = useState(
    value ? value.getMinutes().toString().padStart(2, '0') : '00'
  )

  // 當日期改變時
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
    
    // 合併日期和時間
    const newDateTime = new Date(date)
    newDateTime.setHours(parseInt(hours) || 0)
    newDateTime.setMinutes(parseInt(minutes) || 0)
    onChange(newDateTime)
  }

  // 當時間改變時
  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    // 只允許數字
    const numericValue = value.replace(/\D/g, '')
    
    if (type === 'hours') {
      const h = Math.min(23, Math.max(0, parseInt(numericValue) || 0))
      const formattedHours = h.toString().padStart(2, '0')
      setHours(formattedHours)
      
      if (selectedDate) {
        const newDateTime = new Date(selectedDate)
        newDateTime.setHours(h)
        newDateTime.setMinutes(parseInt(minutes) || 0)
        onChange(newDateTime)
      }
    } else {
      const m = Math.min(59, Math.max(0, parseInt(numericValue) || 0))
      const formattedMinutes = m.toString().padStart(2, '0')
      setMinutes(formattedMinutes)
      
      if (selectedDate) {
        const newDateTime = new Date(selectedDate)
        newDateTime.setHours(parseInt(hours) || 0)
        newDateTime.setMinutes(m)
        onChange(newDateTime)
      }
    }
  }

  // 當 value 從外部更新時，同步內部狀態
  if (value && (!selectedDate || value.getTime() !== selectedDate.getTime())) {
    setSelectedDate(value)
    setHours(value.getHours().toString().padStart(2, '0'))
    setMinutes(value.getMinutes().toString().padStart(2, '0'))
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {value ? format(value, 'yyyy-MM-dd HH:mm') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <div className='flex flex-col'>
          {/* 日曆 */}
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
          
          {/* 時間選擇 */}
          <div className='border-t p-3'>
            <div className='flex items-center gap-2'>
              <div className='flex-1'>
                <label className='text-xs text-muted-foreground mb-1 block'>
                  時
                </label>
                <Input
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  value={hours}
                  onChange={(e) => handleTimeChange('hours', e.target.value)}
                  onBlur={(e) => {
                    const h = Math.min(23, Math.max(0, parseInt(e.target.value) || 0))
                    setHours(h.toString().padStart(2, '0'))
                  }}
                  className='text-center h-12 text-lg'
                  maxLength={2}
                />
              </div>
              <span className='text-2xl font-bold mt-5'>:</span>
              <div className='flex-1'>
                <label className='text-xs text-muted-foreground mb-1 block'>
                  分
                </label>
                <Input
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  value={minutes}
                  onChange={(e) => handleTimeChange('minutes', e.target.value)}
                  onBlur={(e) => {
                    const m = Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
                    setMinutes(m.toString().padStart(2, '0'))
                  }}
                  className='text-center h-12 text-lg'
                  maxLength={2}
                />
              </div>
            </div>
          </div>
          
          {/* 確認按鈕 */}
          <div className='border-t p-3'>
            <Button
              onClick={() => setOpen(false)}
              className='w-full'
              size='sm'
            >
              確認
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
