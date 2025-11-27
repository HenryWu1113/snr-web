/**
 * 新增交易表單 Modal
 */

'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from './image-upload'
import { tradeFormSchema, type TradeFormData, type CloudinaryImage } from '@/lib/validations/trade'
import { cn } from '@/lib/utils'

interface AddTradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface OptionData {
  id: string
  name: string
}

export function AddTradeModal({ open, onOpenChange, onSuccess }: AddTradeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [options, setOptions] = useState<{
    tradeTypes: OptionData[]
    commodities: OptionData[]
    timeframes: OptionData[]
    trendlineTypes: OptionData[]
    entryTypes: OptionData[]
  }>({
    tradeTypes: [],
    commodities: [],
    timeframes: [],
    trendlineTypes: [],
    entryTypes: [],
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      tradeDate: new Date(),
      orderDate: new Date(),
      entryTypeIds: [],
      screenshots: [],
    },
  })

  // 載入下拉選單選項
  useEffect(() => {
    async function loadOptions() {
      try {
        const [tradeTypes, commodities, timeframes, trendlineTypes, entryTypes] =
          await Promise.all([
            fetch('/api/options/trade-types').then((r) => r.json()),
            fetch('/api/options/commodities').then((r) => r.json()),
            fetch('/api/options/timeframes').then((r) => r.json()),
            fetch('/api/options/trendline-types').then((r) => r.json()),
            fetch('/api/options/entry-types').then((r) => r.json()),
          ])

        setOptions({
          tradeTypes: tradeTypes.data || [],
          commodities: commodities.data || [],
          timeframes: timeframes.data || [],
          trendlineTypes: trendlineTypes.data || [],
          entryTypes: entryTypes.data || [],
        })
      } catch (error) {
        console.error('Failed to load options:', error)
      }
    }

    if (open) {
      loadOptions()
    }
  }, [open])

  // 監聽欄位變化以自動計算
  const stopLossTicks = watch('stopLossTicks')
  const targetRRatio = watch('targetRRatio')

  const onSubmit = async (data: TradeFormData) => {
    setIsSubmitting(true)

    try {
      // 1. 先上傳圖片到 Cloudinary
      const uploadedImages = []
      if (data.screenshots && data.screenshots.length > 0) {
        for (const file of data.screenshots) {
          const formData = new FormData()
          formData.append('file', file)

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error('圖片上傳失敗')
          }

          const uploadResult = await uploadResponse.json()
          uploadedImages.push({
            publicId: uploadResult.data.public_id,
            url: uploadResult.data.url,
            secureUrl: uploadResult.data.secure_url,
            width: uploadResult.data.width,
            height: uploadResult.data.height,
            format: uploadResult.data.format,
          })
        }
      }

      // 2. 提交交易資料（包含已上傳的圖片 URLs）
      const tradeData = {
        ...data,
        screenshots: uploadedImages,
      }

      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create trade')
      }

      // 成功後重置表單並關閉 modal
      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Submit error:', error)
      alert(error instanceof Error ? error.message : '新增交易失敗')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 處理多選 Checkbox
  const handleCheckboxChange = (
    field: 'entryTypeIds',
    value: string,
    checked: boolean
  ) => {
    const currentValues = watch(field) || []
    if (checked) {
      setValue(field, [...currentValues, value])
    } else {
      setValue(
        field,
        currentValues.filter((v) => v !== value)
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新增交易紀錄</DialogTitle>
          <DialogDescription>填寫交易詳細資訊並上傳截圖</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 日期與交易類型 */}
          <div className="grid grid-cols-3 gap-4">
            {/* 交易日期（圖表日期）*/}
            <div className="space-y-2">
              <Label htmlFor="tradeDate">交易日（圖表日期）*</Label>
              <Controller
                control={control}
                name="tradeDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'yyyy-MM-dd') : '選擇日期'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.tradeDate && (
                <p className="text-sm text-destructive">{errors.tradeDate.message}</p>
              )}
            </div>

            {/* 下單日期 */}
            <div className="space-y-2">
              <Label htmlFor="orderDate">下單日 *</Label>
              <Controller
                control={control}
                name="orderDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'yyyy-MM-dd') : '選擇日期'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.orderDate && (
                <p className="text-sm text-destructive">{errors.orderDate.message}</p>
              )}
            </div>

            {/* 交易類型 */}
            <div className="space-y-2">
              <Label htmlFor="tradeTypeId">交易類型 *</Label>
              <Controller
                control={control}
                name="tradeTypeId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇類型" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.tradeTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tradeTypeId && (
                <p className="text-sm text-destructive">{errors.tradeTypeId.message}</p>
              )}
            </div>
          </div>

          {/* 第二行：商品、時間框架、趨勢線類型 */}
          <div className="grid grid-cols-3 gap-4">
            {/* 商品 */}
            <div className="space-y-2">
              <Label htmlFor="commodityId">商品 *</Label>
              <Controller
                control={control}
                name="commodityId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇商品" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.commodities.map((commodity) => (
                        <SelectItem key={commodity.id} value={commodity.id}>
                          {commodity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.commodityId && (
                <p className="text-sm text-destructive">{errors.commodityId.message}</p>
              )}
            </div>

            {/* 時間框架 */}
            <div className="space-y-2">
              <Label htmlFor="timeframeId">時間框架 *</Label>
              <Controller
                control={control}
                name="timeframeId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇時間框架" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.timeframes.map((timeframe) => (
                        <SelectItem key={timeframe.id} value={timeframe.id}>
                          {timeframe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.timeframeId && (
                <p className="text-sm text-destructive">{errors.timeframeId.message}</p>
              )}
            </div>

            {/* 趨勢線類型 */}
            <div className="space-y-2">
              <Label htmlFor="trendlineTypeId">趨勢線類型</Label>
              <Controller
                control={control}
                name="trendlineTypeId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇趨勢線" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.trendlineTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* 進場類型（多選）*/}
          <div className="space-y-2">
            <Label>進場類型 *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg">
              {options.entryTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`entryType-${type.id}`}
                    checked={watch('entryTypeIds')?.includes(type.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('entryTypeIds', type.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`entryType-${type.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {type.name}
                  </label>
                </div>
              ))}
            </div>
            {errors.entryTypeIds && (
              <p className="text-sm text-destructive">{errors.entryTypeIds.message}</p>
            )}
          </div>

          {/* RR 計算欄位 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stopLossTicks">停損點數 *</Label>
              <Input
                id="stopLossTicks"
                type="number"
                {...register('stopLossTicks')}
                placeholder="例如：10"
              />
              {errors.stopLossTicks && (
                <p className="text-sm text-destructive">{errors.stopLossTicks.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetRRatio">目標 RR 比例 *</Label>
              <Input
                id="targetRRatio"
                {...register('targetRRatio')}
                placeholder="例如：1:3"
              />
              {errors.targetRRatio && (
                <p className="text-sm text-destructive">{errors.targetRRatio.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="actualExitTicks">實際出場點數 *</Label>
              <Input
                id="actualExitTicks"
                type="number"
                {...register('actualExitTicks')}
                placeholder="例如：25"
              />
              {errors.actualExitTicks && (
                <p className="text-sm text-destructive">{errors.actualExitTicks.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profitLoss">損益 *</Label>
              <Input
                id="profitLoss"
                type="number"
                step="0.01"
                {...register('profitLoss')}
                placeholder="例如：250.50"
              />
              {errors.profitLoss && (
                <p className="text-sm text-destructive">{errors.profitLoss.message}</p>
              )}
            </div>
          </div>

          {/* 備註 */}
          <div className="space-y-2">
            <Label htmlFor="notes">備註</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="記錄交易心得、市場觀察等..."
              rows={4}
            />
          </div>

          {/* 圖片上傳 */}
          <div className="space-y-2">
            <Label>交易截圖</Label>
            <Controller
              control={control}
              name="screenshots"
              render={({ field }) => (
                <ImageUpload
                  value={field.value || []}
                  onChange={field.onChange}
                  maxImages={5}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? '新增中...' : '新增交易'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
