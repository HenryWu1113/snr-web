/**
 * 交易表單 Modal（新增/編輯）
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
  DialogFooter
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
  SelectValue
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ImageUploadWithExisting,
  type ImageUploadValue
} from './image-upload-with-existing'
import { Fireworks } from '@/components/effects/fireworks'
import {
  tradeFormSchema,
  type TradeFormData,
  type CloudinaryImage
} from '@/lib/validations/trade'
import { cn } from '@/lib/utils'
import type { TradeWithRelations } from '@/types/datatable'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface TradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  trade?: TradeWithRelations | null // 如果提供 trade，則為編輯模式
}

interface OptionData {
  id: string
  name: string
}

export function TradeModal({
  open,
  onOpenChange,
  onSuccess,
  trade
}: TradeModalProps) {
  const { toast } = useToast()
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
    entryTypes: []
  })

  const isEditMode = !!trade
  const [imageValue, setImageValue] = useState<ImageUploadValue>({
    newFiles: [],
    existingImages: []
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeFormSchema) as any,
    defaultValues: trade ? {
      tradeDate: new Date(trade.tradeDate),
      orderDate: new Date(trade.orderDate),
      tradeTypeId: trade.tradeType?.id || '',
      commodityId: trade.commodity?.id || '',
      timeframeId: trade.timeframe?.id || '',
      trendlineTypeId: trade.trendlineType?.id || '',
      position: trade.position || 'LONG',
      entryTypeIds: trade.entryTypes.map((et) => et.id),
      stopLossTicks: trade.stopLossTicks,
      targetR: trade.targetR,
      actualExitR: trade.actualExitR,
      leverage: trade.leverage,
      profitLoss: trade.profitLoss,
      notes: trade.notes || '',
      screenshots: []
    } : {
      tradeDate: new Date(),
      orderDate: new Date(),
      position: 'LONG',
      entryTypeIds: [],
      screenshots: []
    }
  })

  // 載入下拉選單選項
  useEffect(() => {
    async function loadOptions() {
      try {
        const [
          tradeTypes,
          commodities,
          timeframes,
          trendlineTypes,
          entryTypes
        ] = await Promise.all([
          fetch('/api/options/trade-types').then((r) => r.json()),
          fetch('/api/options/commodities').then((r) => r.json()),
          fetch('/api/options/timeframes').then((r) => r.json()),
          fetch('/api/options/trendline-types').then((r) => r.json()),
          fetch('/api/options/entry-types').then((r) => r.json())
        ])

        setOptions({
          tradeTypes: tradeTypes.data || [],
          commodities: commodities.data || [],
          timeframes: timeframes.data || [],
          trendlineTypes: trendlineTypes.data || [],
          entryTypes: entryTypes.data || []
        })
        
        console.log('Options loaded:', {
          tradeTypes: tradeTypes.data?.length,
          commodities: commodities.data?.length,
          timeframes: timeframes.data?.length,
          trendlineTypes: trendlineTypes.data?.length,
          entryTypes: entryTypes.data?.length
        })
      } catch (error) {
        console.error('Failed to load options:', error)
      }
    }

    if (open) {
      loadOptions()
    }
  }, [open])

  // 當編輯模式時，載入交易資料
  useEffect(() => {
    if (open && trade) {
      reset({
        tradeDate: new Date(trade.tradeDate),
        orderDate: new Date(trade.orderDate),
        tradeTypeId: trade.tradeType?.id || '',
        commodityId: trade.commodity?.id || '',
        timeframeId: trade.timeframe?.id || '',
        trendlineTypeId: trade.trendlineType?.id || '',
        position: trade.position || 'LONG',
        entryTypeIds: trade.entryTypes.map((et) => et.id),
        stopLossTicks: trade.stopLossTicks,
        targetR: trade.targetR,
        actualExitR: trade.actualExitR,
        leverage: trade.leverage,
        profitLoss: trade.profitLoss,
        notes: trade.notes || '',
        screenshots: []
      })
      // 載入現有圖片
      setImageValue({
        newFiles: [],
        existingImages: (trade.screenshotUrls as CloudinaryImage[]) || []
      })
    } else if (open && !trade) {
      // 新增模式，重置表單
      reset({
        tradeDate: new Date(),
        orderDate: new Date(),
        position: 'LONG',
        entryTypeIds: [],
        screenshots: []
      })
      setImageValue({
        newFiles: [],
        existingImages: []
      })
    }
  }, [open, trade, reset])

  // 監聽欄位變化以自動計算
  const stopLossTicks = watch('stopLossTicks')
  const targetR = watch('targetR')
  const actualExitR = watch('actualExitR')

  // 計算目標點數（僅顯示，不儲存）
  const targetTicks =
    stopLossTicks && targetR ? Math.round(stopLossTicks * targetR) : 0

  // 判斷勝敗狀態
  const getTradeStatus = () => {
    if (!actualExitR) return null
    if (actualExitR > 0.1) {
      return {
        label: actualExitR >= 1 ? '大勝' : '勝',
        variant: 'default' as const,
        className: 'bg-green-600 text-white'
      }
    }
    if (actualExitR < -0.1)
      return {
        label: '敗',
        variant: 'destructive' as const,
        className: ''
      }
    return {
      label: '平',
      variant: 'secondary' as const,
      className: ''
    }
  }

  const tradeStatus = getTradeStatus()

  const onSubmit = async (data: TradeFormData) => {
    setIsSubmitting(true)

    try {
      // 1. 處理圖片上傳
      let finalImages: CloudinaryImage[] = [...imageValue.existingImages]

      // 上傳新圖片
      if (imageValue.newFiles.length > 0) {
        for (const file of imageValue.newFiles) {
          const formData = new FormData()
          formData.append('file', file)

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          if (!uploadResponse.ok) {
            throw new Error('圖片上傳失敗')
          }

          const uploadResult = await uploadResponse.json()
          finalImages.push({
            publicId: uploadResult.data.public_id,
            url: uploadResult.data.url,
            secureUrl: uploadResult.data.secure_url,
            width: uploadResult.data.width,
            height: uploadResult.data.height,
            format: uploadResult.data.format
          })
        }
      }

      // 2. 提交交易資料
      const tradeData = {
        ...data,
        screenshots: finalImages
      }

      const url = isEditMode ? `/api/trades/${trade.id}` : '/api/trades'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.error || `Failed to ${isEditMode ? 'update' : 'create'} trade`
        )
      }

      // 成功後顯示 toast 提示
      toast({
        title: isEditMode ? '更新成功' : '新增成功',
        description: `交易紀錄已${isEditMode ? '更新' : '新增'}`,
      })

      // 重置表單並關閉 modal
      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Submit error:', error)
      
      // 錯誤時顯示 toast
      toast({
        title: isEditMode ? '更新失敗' : '新增失敗',
        description: error instanceof Error ? error.message : `${isEditMode ? '更新' : '新增'}交易失敗`,
        variant: 'destructive',
      })
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
    <>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className='max-h-[90vh] w-full sm:max-w-[900px] flex flex-col overflow-hidden p-0'
          background={<Fireworks active={!!actualExitR && Number(actualExitR) > 1} />}
        >
          <DialogHeader className='shrink-0 border-b px-6 pt-6 pb-4'>
            <DialogTitle>
              {isEditMode ? '編輯交易紀錄' : '新增交易紀錄'}
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                {isEditMode ? (
                  <div className="flex flex-col gap-1 mt-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="shrink-0">ID:</span>
                      <span className="font-mono select-all text-foreground/80">{trade?.id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>建立:</span>
                        <span className="font-mono">{trade?.createdAt ? format(new Date(trade.createdAt), 'yyyy/MM/dd HH:mm:ss') : '-'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>更新:</span>
                        <span className="font-mono">{trade?.updatedAt ? format(new Date(trade.updatedAt), 'yyyy/MM/dd HH:mm:ss') : '-'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  '填寫交易詳細資訊並上傳截圖'
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex-1 overflow-y-auto space-y-6 min-h-0 px-6 py-4'
          >
            {/* 第一行：交易日、下單日 */}
            <div className='grid grid-cols-2 gap-4'>
              {/* 交易日期（圖表日期）*/}
              <div className='space-y-2'>
                <Label htmlFor='tradeDate'>
                  交易日（圖表日期）<span className='text-destructive'>*</span>
                </Label>
                <Controller
                  control={control}
                  name='tradeDate'
                  render={({ field }) => (
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {field.value
                            ? format(field.value, 'yyyy-MM-dd')
                            : '選擇日期'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.tradeDate && (
                  <p className='text-sm text-destructive'>
                    {errors.tradeDate.message}
                  </p>
                )}
              </div>

              {/* 下單日期 */}
              <div className='space-y-2'>
                <Label htmlFor='orderDate'>
                  下單日<span className='text-destructive'>*</span>
                </Label>
                <Controller
                  control={control}
                  name='orderDate'
                  render={({ field }) => (
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {field.value
                            ? format(field.value, 'yyyy-MM-dd')
                            : '選擇日期'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.orderDate && (
                  <p className='text-sm text-destructive'>
                    {errors.orderDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* 第二行：商品、交易類型 */}
            <div className='grid grid-cols-2 gap-4'>
              {/* 商品 */}
              <div className='space-y-2'>
                <Label htmlFor='commodityId'>
                  商品<span className='text-destructive'>*</span>
                </Label>
                <Controller
                  control={control}
                  name='commodityId'
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                      key={field.value || 'empty'}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='選擇商品' />
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
                  <p className='text-sm text-destructive'>
                    {errors.commodityId.message}
                  </p>
                )}
              </div>

              {/* 交易類型 */}
              <div className='space-y-2'>
                <Label htmlFor='tradeTypeId'>
                  交易類型<span className='text-destructive'>*</span>
                </Label>
                <Controller
                  control={control}
                  name='tradeTypeId'
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                      key={field.value || 'empty'}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='選擇類型' />
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
                  <p className='text-sm text-destructive'>
                    {errors.tradeTypeId.message}
                  </p>
                )}
              </div>
            </div>

            {/* 第三行：時間框架、趨勢線類型 */}
            <div className='grid grid-cols-2 gap-4'>
              {/* 時間框架 */}
              <div className='space-y-2'>
                <Label htmlFor='timeframeId'>
                  時間框架<span className='text-destructive'>*</span>
                </Label>
                <Controller
                  control={control}
                  name='timeframeId'
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                      key={field.value || 'empty'}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='選擇時間框架' />
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
                  <p className='text-sm text-destructive'>
                    {errors.timeframeId.message}
                  </p>
                )}
              </div>

              {/* 趨勢線類型 */}
              <div className='space-y-2'>
                <Label htmlFor='trendlineTypeId'>
                  趨勢線類型<span className='text-destructive'>*</span>
                </Label>
                <Controller
                  control={control}
                  name='trendlineTypeId'
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                      key={field.value || 'empty'}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='選擇趨勢線' />
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
                {errors.trendlineTypeId && (
                  <p className='text-sm text-destructive'>
                    {errors.trendlineTypeId.message}
                  </p>
                )}
              </div>
            </div>

            {/* 第四行：做多/做空 */}
            <div className='space-y-2'>
              <Label htmlFor='position'>
                做多/做空<span className='text-destructive'>*</span>
              </Label>
              <Controller
                control={control}
                name='position'
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || undefined}
                    key={field.value || 'empty'}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='選擇做多或做空' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='LONG'>做多 (Long)</SelectItem>
                      <SelectItem value='SHORT'>做空 (Short)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.position && (
                <p className='text-sm text-destructive'>
                  {errors.position.message}
                </p>
              )}
            </div>

            {/* 進場類型（多選）*/}
            <div className='space-y-2'>
              <Label>
                進場類型<span className='text-destructive'>*</span>
              </Label>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg'>
                {options.entryTypes.map((type) => (
                  <div key={type.id} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`entryType-${type.id}`}
                      checked={watch('entryTypeIds')?.includes(type.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          'entryTypeIds',
                          type.id,
                          checked as boolean
                        )
                      }
                    />
                    <label
                      htmlFor={`entryType-${type.id}`}
                      className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
                    >
                      {type.name}
                    </label>
                  </div>
                ))}
              </div>
              {errors.entryTypeIds && (
                <p className='text-sm text-destructive'>
                  {errors.entryTypeIds.message}
                </p>
              )}
            </div>

            {/* RR 計算欄位 - 第一排（紅色）：目標R、實際出場R */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='targetR'>
                  目標 R<span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='targetR'
                  type='number'
                  step='0.1'
                  {...register('targetR')}
                  placeholder='例如：5 或 1.5'
                />
                {errors.targetR && (
                  <p className='text-sm text-destructive'>
                    {errors.targetR.message}
                  </p>
                )}
                <p className='text-xs text-muted-foreground'>
                  賠的R固定為1，此欄位為目標獲勝R
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='actualExitR'>
                  實際出場 R<span className='text-destructive'>*</span>
                </Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='actualExitR'
                    type='number'
                    step='0.1'
                    {...register('actualExitR')}
                    placeholder='例如：3.5 或 -0.8'
                    className='flex-1'
                  />
                  {tradeStatus && (
                    <Badge
                      variant={tradeStatus.variant}
                      className={cn(
                        'h-10 px-4 text-base font-semibold',
                        tradeStatus.className
                      )}
                    >
                      {tradeStatus.label}
                    </Badge>
                  )}
                </div>
                {errors.actualExitR && (
                  <p className='text-sm text-destructive'>
                    {errors.actualExitR.message}
                  </p>
                )}
                <p className='text-xs text-muted-foreground'>
                  範圍：-1 到目標R
                </p>
              </div>
            </div>

            {/* 第二排（藍色）：停損點數、目標點數 */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='stopLossTicks'>
                  停損點數<span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='stopLossTicks'
                  type='number'
                  {...register('stopLossTicks')}
                  placeholder='例如：350'
                />
                {errors.stopLossTicks && (
                  <p className='text-sm text-destructive'>
                    {errors.stopLossTicks.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>目標點數（自動計算）</Label>
                <Input
                  type='number'
                  value={targetTicks}
                  disabled
                  className='bg-muted'
                />
                <p className='text-xs text-muted-foreground'>
                  = 停損點數 × 目標R
                </p>
              </div>
            </div>

            {/* 第三排（綠色）：槓桿倍數、損益 */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='leverage'>
                  槓桿倍數<span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='leverage'
                  type='number'
                  step='1'
                  {...register('leverage')}
                  placeholder='例如：10'
                />
                {errors.leverage && (
                  <p className='text-sm text-destructive'>
                    {errors.leverage.message}
                  </p>
                )}
                <p className='text-xs text-muted-foreground'>
                  暫時只允許填整數
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='profitLoss'>
                  損益<span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='profitLoss'
                  type='number'
                  step='1'
                  {...register('profitLoss')}
                  placeholder='例如：250.50'
                />
                {errors.profitLoss && (
                  <p className='text-sm text-destructive'>
                    {errors.profitLoss.message}
                  </p>
                )}
              </div>
            </div>

            {/* 備註 */}
            <div className='space-y-2'>
              <Label htmlFor='notes'>備註</Label>
              <Textarea
                id='notes'
                {...register('notes')}
                placeholder='記錄交易心得、市場觀察等...'
                rows={4}
              />
            </div>

            {/* 圖片上傳 */}
            <div className='space-y-2'>
              <Label>交易截圖</Label>
              <ImageUploadWithExisting
                value={imageValue}
                onChange={setImageValue}
                maxImages={5}
                disabled={isSubmitting}
              />
            </div>
          </form>

          <DialogFooter className='shrink-0 border-t px-6 py-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {isSubmitting
                ? isEditMode
                  ? '更新中...'
                  : '新增中...'
                : isEditMode
                ? '更新交易'
                : '新增交易'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// 向後相容的別名
export { TradeModal as AddTradeModal }
