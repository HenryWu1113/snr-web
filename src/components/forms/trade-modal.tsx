/**
 * 交易表單 Modal（新增/編輯）
 */

'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Heart, Bookmark } from 'lucide-react'
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
import { determineTradingSession, getTradingSessionLabel } from '@/lib/trading-session'
import { CollectionDialog } from '@/components/dialogs/collection-dialog'
import { toast as sonnerToast } from 'sonner'
import { useAllTradeOptions } from '@/hooks/use-trade-options-query'

interface TradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  trade?: TradeWithRelations | null // 如果提供 trade，則為編輯模式
}

export function TradeModal({
  open,
  onOpenChange,
  onSuccess,
  trade
}: TradeModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ⚡ 使用 React Query 載入選項（自動快取）
  const { options, isLoading: optionsLoading } = useAllTradeOptions()

  const isEditMode = !!trade
  const [imageValue, setImageValue] = useState<ImageUploadValue>({
    newFiles: [],
    existingImages: []
  })
  const [initialImageCount, setInitialImageCount] = useState(0)
  const [isFavorite, setIsFavorite] = useState(trade?.isFavorite || false)
  const [showCollectionDialog, setShowCollectionDialog] = useState(false)
  const [hasCollections, setHasCollections] = useState(false)
  
  // 交易日期的時間狀態
  const [tradeDateHours, setTradeDateHours] = useState('00')
  const [tradeDateMinutes, setTradeDateMinutes] = useState('00')


  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
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
      tagIds: trade.tradeTags?.map((tt) => tt.tag.id) || [],
      holdingTimeMinutes: trade.holdingTimeMinutes || undefined,
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
      tradeTypeId: '',
      commodityId: '',
      timeframeId: '',
      trendlineTypeId: '',
      position: 'LONG',
      entryTypeIds: [],
      tagIds: [],
      holdingTimeMinutes: undefined,
      stopLossTicks: undefined,
      targetR: undefined,
      actualExitR: undefined,
      leverage: undefined,
      profitLoss: undefined,
      notes: '',
      screenshots: []
    }
  })

  // 當編輯模式時，載入交易資料
  useEffect(() => {
    if (open) {
      if (trade) {
        reset({
          tradeDate: new Date(trade.tradeDate),
          orderDate: new Date(trade.orderDate),
          tradeTypeId: trade.tradeType?.id || '',
          commodityId: trade.commodity?.id || '',
          timeframeId: trade.timeframe?.id || '',
          trendlineTypeId: trade.trendlineType?.id || '',
          position: trade.position || 'LONG',
          entryTypeIds: trade.entryTypes.map((et) => et.id),
          tagIds: trade.tradeTags?.map((tt) => tt.tag.id) || [],
          holdingTimeMinutes: trade.holdingTimeMinutes || undefined,
          stopLossTicks: trade.stopLossTicks,
          targetR: trade.targetR,
          actualExitR: trade.actualExitR,
          leverage: trade.leverage,
          profitLoss: trade.profitLoss,
          notes: trade.notes || '',
          screenshots: []
        })
        // 載入現有圖片
        const existingImages = (trade.screenshotUrls as CloudinaryImage[]) || []
        setImageValue({
          newFiles: [],
          existingImages
        })
        setInitialImageCount(existingImages.length)
        
        // 載入交易日期的時間
        const tradeDateTime = new Date(trade.tradeDate)
        setTradeDateHours(tradeDateTime.getHours().toString().padStart(2, '0'))
        setTradeDateMinutes(tradeDateTime.getMinutes().toString().padStart(2, '0'))
      } else {
        // 新增模式，重置表單
        reset({
          tradeDate: new Date(),
          orderDate: new Date(),
          tradeTypeId: '',
          commodityId: '',
          timeframeId: '',
          trendlineTypeId: '',
          position: 'LONG',
          entryTypeIds: [],
          tagIds: [],
          holdingTimeMinutes: undefined,
          stopLossTicks: undefined,
          targetR: undefined,
          actualExitR: undefined,
          leverage: undefined,
          profitLoss: undefined,
          notes: '',
          screenshots: []
        })
        setImageValue({
          newFiles: [],
          existingImages: []
        })
        setInitialImageCount(0)
        
        // 新增模式，設置當前時間
        const now = new Date()
        setTradeDateHours(now.getHours().toString().padStart(2, '0'))
        setTradeDateMinutes(now.getMinutes().toString().padStart(2, '0'))
      }
    } else {
      // 關閉時重置圖片狀態
      setImageValue({
        newFiles: [],
        existingImages: []
      })
      setInitialImageCount(0)
    }
  }, [open, trade, reset])

  // 監聽欄位變化以自動計算
  const stopLossTicks = watch('stopLossTicks')
  const targetR = watch('targetR')
  const actualExitR = watch('actualExitR')
  const watchedTradeDate = watch('tradeDate')

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
    field: 'entryTypeIds' | 'tagIds',
    value: string,
    checked: boolean
  ) => {
    const currentValues = watch(field) || []
    if (checked) {
      setValue(field, [...currentValues, value], { shouldDirty: true })
    } else {
      setValue(
        field,
        currentValues.filter((v) => v !== value),
        { shouldDirty: true }
      )
    }
  }

  // 明確的關閉函數（用於取消按鈕）
  const handleExplicitClose = () => {
    onOpenChange(false)
  }

  // 切換喜歡狀態（僅編輯模式）
  const handleToggleFavorite = async () => {
    if (!trade) return
    try {
      const res = await fetch(`/api/trades/${trade.id}/favorite`, {
        method: 'PATCH',
      })
      if (!res.ok) throw new Error('Failed to toggle favorite')
      const data = await res.json()
      setIsFavorite(data.data.isFavorite)
      sonnerToast.success(data.data.isFavorite ? '已加入喜歡' : '已取消喜歡')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      sonnerToast.error('操作失敗')
    }
  }

  // 載入收藏狀態
  useEffect(() => {
    if (open && trade) {
      setIsFavorite(trade.isFavorite || false)
      // 檢查是否有收藏
      fetch(`/api/trades/${trade.id}/collections`)
        .then((res) => res.json())
        .then((data) => {
          setHasCollections((data.data?.length || 0) > 0)
        })
        .catch(() => setHasCollections(false))
    }
  }, [open, trade])

  return (
    <>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className='max-h-[90vh] w-full sm:max-w-[900px] flex flex-col overflow-hidden p-0'
          background={<Fireworks active={!!actualExitR && Number(actualExitR) > 1} />}
          onPointerDownOutside={(e) => {
            const hasNewImages = imageValue.newFiles.length > 0
            const hasDeletedImages = imageValue.existingImages.length !== initialImageCount
            const hasImageChanges = hasNewImages || hasDeletedImages
            
            // 檢查是否點擊在原生日期選擇器上（iOS/iPadOS 會在 body 外渲染原生控制項）
            const target = e.target as HTMLElement
            const isDateTimeInput = target?.tagName === 'INPUT' && 
              (target as HTMLInputElement).type === 'datetime-local'
            
            // 如果有未保存的更改，或者正在與日期選擇器互動，則阻止關閉
            if (isDirty || hasImageChanges || isDateTimeInput) {
              e.preventDefault()
            }
          }}
          onInteractOutside={(e) => {
            // 額外阻止 iOS 日期選擇器觸發的關閉行為
            const target = e.target as HTMLElement
            if (target?.closest('[data-radix-popper-content-wrapper]') || 
                target?.tagName === 'INPUT') {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader className='shrink-0 border-b px-6 pt-6 pb-4'>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>{isEditMode ? '編輯交易紀錄' : '新增交易紀錄'}</span>
                {(isDirty || imageValue.newFiles.length > 0 || imageValue.existingImages.length !== initialImageCount) && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    未儲存
                  </span>
                )}
              </div>
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                {isEditMode ? (
                  <div className="flex flex-col gap-1 mt-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="shrink-0">ID:</span>
                        <span className="font-mono select-all text-foreground/80">{trade?.id}</span>
                      </div>
                      {/* 喜歡和收藏按鈕 */}
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleToggleFavorite}
                          className="h-7 w-7 p-0"
                          title={isFavorite ? '取消喜歡' : '加入喜歡'}
                        >
                          <Heart
                            className={cn(
                              'h-4 w-4',
                              isFavorite && 'fill-red-500 text-red-500'
                            )}
                          />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCollectionDialog(true)}
                          className="h-7 w-7 p-0"
                          title="加入收藏"
                        >
                          <Bookmark
                            className={cn(
                              'h-4 w-4',
                              hasCollections && 'fill-yellow-500 text-yellow-500'
                            )}
                          />
                        </Button>
                      </div>
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
                            ? format(field.value, 'yyyy-MM-dd HH:mm')
                            : '選擇交易日期和時間'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <div className='flex flex-col'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={(date) => {
                              if (!date) return
                              const newDateTime = new Date(date)
                              newDateTime.setHours(parseInt(tradeDateHours) || 0)
                              newDateTime.setMinutes(parseInt(tradeDateMinutes) || 0)
                              field.onChange(newDateTime)
                            }}
                            initialFocus
                          />
                          <div className='border-t p-3'>
                            <div className='flex items-center justify-center gap-2'>
                              <div className='flex flex-col items-center'>
                                <label className='text-xs text-muted-foreground mb-1'>
                                  時
                                </label>
                                <Input
                                  type='number'
                                  min={0}
                                  max={23}
                                  value={tradeDateHours}
                                  onChange={(e) => {
                                    const h = Math.min(23, Math.max(0, parseInt(e.target.value) || 0))
                                    setTradeDateHours(h.toString().padStart(2, '0'))
                                    if (field.value) {
                                      const newDateTime = new Date(field.value)
                                      newDateTime.setHours(h)
                                      field.onChange(newDateTime)
                                    }
                                  }}
                                  className='w-16 text-center h-10 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-auto [&::-webkit-inner-spin-button]:appearance-auto'
                                />
                              </div>
                              <span className='text-xl font-bold mt-5'>:</span>
                              <div className='flex flex-col items-center'>
                                <label className='text-xs text-muted-foreground mb-1'>
                                  分
                                </label>
                                <Input
                                  type='number'
                                  min={0}
                                  max={59}
                                  value={tradeDateMinutes}
                                  onChange={(e) => {
                                    const m = Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
                                    setTradeDateMinutes(m.toString().padStart(2, '0'))
                                    if (field.value) {
                                      const newDateTime = new Date(field.value)
                                      newDateTime.setMinutes(m)
                                      field.onChange(newDateTime)
                                    }
                                  }}
                                  className='w-16 text-center h-10 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-auto [&::-webkit-inner-spin-button]:appearance-auto'
                                />
                              </div>
                            </div>
                          </div>
                        </div>
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

            {/* 自定義標籤（多選，非必填）*/}
            <div className='space-y-2'>
              <Label>自定義標籤（可多選）</Label>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg'>
                {options.tradingTags.length > 0 ? (
                  options.tradingTags.map((tag) => (
                    <div key={tag.id} className='flex items-center space-x-2'>
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={watch('tagIds')?.includes(tag.id)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            'tagIds',
                            tag.id,
                            checked as boolean
                          )
                        }
                      />
                      <label
                        htmlFor={`tag-${tag.id}`}
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
                      >
                        {tag.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className='text-sm text-muted-foreground col-span-full text-center py-2'>
                    尚無標籤，請至設定頁面新增
                  </p>
                )}
              </div>
              {errors.tagIds && (
                <p className='text-sm text-destructive'>
                  {errors.tagIds.message}
                </p>
              )}
            </div>

            {/* 第四排：持倉時間、交易時段 */}
            <div className='grid grid-cols-2 gap-4'>
              {/* 持倉時間 */}
              <div className='space-y-2'>
                <Label htmlFor='holdingTimeMinutes'>持倉時間（分鐘）</Label>
                <Input
                  id='holdingTimeMinutes'
                  type='number'
                  {...register('holdingTimeMinutes')}
                  placeholder='例如：120'
                />
                {errors.holdingTimeMinutes && (
                  <p className='text-sm text-destructive'>
                    {errors.holdingTimeMinutes.message}
                  </p>
                )}
                <p className='text-xs text-muted-foreground'>
                  從進場到出場的時間長度
                </p>
              </div>

              {/* 交易時段（自動判斷）*/}
              <div className='space-y-2'>
                <Label>交易時段（自動判斷）</Label>
                <div className='h-10 px-3 py-2 border rounded-md bg-muted flex items-center'>
                  {watchedTradeDate ? (
                    <span className='text-sm font-medium'>
                      {getTradingSessionLabel(determineTradingSession(watchedTradeDate))}
                    </span>
                  ) : (
                    <span className='text-sm text-muted-foreground'>
                      請先選擇交易日期
                    </span>
                  )}
                </div>
                <p className='text-xs text-muted-foreground'>
                  根據交易日期時間自動計算
                </p>
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
              onClick={handleExplicitClose}
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

      {/* 收藏對話框 */}
      {trade && (
        <CollectionDialog
          open={showCollectionDialog}
          onOpenChange={setShowCollectionDialog}
          tradeId={trade.id}
          onSuccess={() => {
            setHasCollections(true)
            onSuccess?.()
          }}
        />
      )}
    </>
  )
}

// 向後相容的別名
export { TradeModal as AddTradeModal }
