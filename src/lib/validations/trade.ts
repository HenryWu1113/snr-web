/**
 * 交易表單驗證 Schema
 */

import { z } from 'zod'

// Cloudinary 圖片資料結構
export const cloudinaryImageSchema = z.object({
  publicId: z.string(),
  url: z.string().url(),
  secureUrl: z.string().url(),
  width: z.number(),
  height: z.number(),
  format: z.string(),
})

export type CloudinaryImage = z.infer<typeof cloudinaryImageSchema>

// 交易表單 Schema
export const tradeFormSchema = z.object({
  // 基本資訊
  tradeDate: z.date({
    required_error: '請選擇交易日期（圖表日期）',
  }),
  orderDate: z.date({
    required_error: '請選擇下單日期',
  }),
  tradeTypeId: z.string().min(1, '請選擇交易類型'),
  commodityId: z.string().min(1, '請選擇商品'),
  timeframeId: z.string().min(1, '請選擇時間框架'),
  trendlineTypeId: z.string().optional(),

  // 多選欄位
  entryTypeIds: z.array(z.string()).min(1, '請至少選擇一個進場類型'),

  // RR 計算欄位
  stopLossTicks: z.coerce
    .number({
      required_error: '請輸入停損點數',
      invalid_type_error: '停損點數必須是數字',
    })
    .int('停損點數必須是整數')
    .positive('停損點數必須大於 0'),

  targetRRatio: z
    .string()
    .min(1, '請輸入目標 RR 比例')
    .regex(/^\d+:\d+$/, '格式必須是 "數字:數字"，例如 "1:3"'),

  actualExitTicks: z.coerce
    .number({
      required_error: '請輸入實際出場點數',
      invalid_type_error: '實際出場點數必須是數字',
    })
    .int('實際出場點數必須是整數'),

  profitLoss: z.coerce
    .number({
      required_error: '請輸入損益',
      invalid_type_error: '損益必須是數字',
    })
    .finite('損益必須是有效數字'),

  // 備註
  notes: z.string().optional(),

  // 截圖（多張）- 改成 File[] 而非 CloudinaryImage[]
  screenshots: z.array(z.instanceof(File)).optional(),
})

export type TradeFormData = z.infer<typeof tradeFormSchema>

// API 專用 Schema（接收已上傳的 CloudinaryImage[]）
export const tradeApiSchema = tradeFormSchema.omit({ screenshots: true }).extend({
  screenshots: z.array(cloudinaryImageSchema).optional(),
})

export type TradeApiData = z.infer<typeof tradeApiSchema>

// 計算相關輔助函數
export function calculateTargetTicks(stopLossTicks: number, targetRRatio: string): number {
  const [risk, reward] = targetRRatio.split(':').map(Number)
  if (!risk || !reward) return 0
  return Math.round((stopLossTicks * reward) / risk)
}

export function calculateActualRMultiple(actualExitTicks: number, stopLossTicks: number): number {
  if (stopLossTicks === 0) return 0
  return Number((actualExitTicks / stopLossTicks).toFixed(2))
}

export function determineWinLoss(actualRMultiple: number): 'win' | 'loss' | 'breakeven' {
  if (actualRMultiple > 0.1) return 'win'
  if (actualRMultiple < -0.1) return 'loss'
  return 'breakeven'
}
