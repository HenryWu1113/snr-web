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
  format: z.string()
})

export type CloudinaryImage = z.infer<typeof cloudinaryImageSchema>

// 交易表單 Schema
export const tradeFormSchema = z
  .object({
    // 基本資訊
    tradeDate: z.date({
      message: '請選擇交易日期（圖表日期）'
    }),
    orderDate: z.date({
      message: '請選擇下單日期'
    }),
    tradeTypeId: z.string().min(1, '請選擇交易類型'),
    commodityId: z.string().min(1, '請選擇商品'),
    timeframeId: z.string().min(1, '請選擇時間框架'),
    trendlineTypeId: z.string().min(1, '請選擇趨勢線類型'),
    position: z.enum(['LONG', 'SHORT'], {
      message: '請選擇做多或做空'
    }),

    // 多選欄位
    entryTypeIds: z.array(z.string()).min(1, '請至少選擇一個進場類型'),

    // RR 計算欄位
    stopLossTicks: z.coerce
      .number({
        message: '停損點數必須是數字'
      })
      .int('停損點數必須是整數')
      .positive('停損點數必須大於 0'),

    targetR: z.coerce
      .number({
        message: '目標 R 必須是數字'
      })
      .positive('目標 R 必須大於 0')
      .multipleOf(0.01, '目標 R 最多到小數點後兩位'),

    actualExitR: z.coerce
      .number({
        message: '實際出場 R 必須是數字'
      })
      .finite('實際出場 R 必須是有效數字')
      .multipleOf(0.01, '實際出場 R 最多到小數點後兩位')
      .gte(-1, '實際出場 R 不能低於 -1'),

    leverage: z.coerce
      .number({
        message: '槓桿倍數必須是數字'
      })
      .positive('槓桿倍數必須大於 0')
      .multipleOf(0.01, '槓桿倍數最多到小數點後兩位'),

    profitLoss: z.coerce
      .number({
        message: '損益必須是數字'
      })
      .finite('損益必須是有效數字'),

    // 備註
    notes: z.string().optional(),

    // 新增欄位
    tagIds: z.array(z.string()).optional(), // 自定義標籤（多選，非必填）
    holdingTimeMinutes: z.coerce
      .number({ message: '持倉時間必須是數字' })
      .int('持倉時間必須是整數')
      .positive('持倉時間必須大於 0')
      .optional(),

    // 截圖（多張）- 改成 File[] 而非 CloudinaryImage[]
    screenshots: z.array(z.instanceof(File)).optional()
  })
  .refine(
    (data) => {
      // 實際出場 R 不能超過目標 R
      return data.actualExitR <= data.targetR
    },
    {
      message: '實際出場 R 不能超過目標 R',
      path: ['actualExitR']
    }
  )
  .refine(
    (data) => {
      // 根據勝負狀態驗證損益
      // 勝利時（actualExitR > 0.1），損益必須為正
      if (data.actualExitR > 0.1 && data.profitLoss <= 0) {
        return false
      }
      // 失敗時（actualExitR < -0.1），損益必須為負
      if (data.actualExitR < -0.1 && data.profitLoss >= 0) {
        return false
      }
      return true
    },
    {
      message: '損益必須符合交易結果：勝利時為正，失敗時為負',
      path: ['profitLoss']
    }
  )

export type TradeFormData = z.infer<typeof tradeFormSchema>

// API 專用 Schema（接收已上傳的 CloudinaryImage[]）
export const tradeApiSchema = tradeFormSchema
  .omit({ screenshots: true, tradeDate: true, orderDate: true })
  .extend({
    // API 接收 ISO 字串格式的日期
    tradeDate: z.string().transform((val) => new Date(val)),
    orderDate: z.string().transform((val) => new Date(val)),
    screenshots: z.array(cloudinaryImageSchema).optional()
  })

export type TradeApiData = z.infer<typeof tradeApiSchema>

// 計算相關輔助函數
/**
 * 計算目標點數
 * @param stopLossTicks 停損點數
 * @param targetR 目標 R（例如 1.5, 2, 3）
 * @returns 目標點數（停損點數 * 目標R）
 */
export function calculateTargetTicks(
  stopLossTicks: number,
  targetR: number
): number {
  return Math.round(stopLossTicks * targetR)
}

/**
 * 計算實際出場 R
 * @param actualExitTicks 實際出場點數
 * @param stopLossTicks 停損點數
 * @returns 實際出場 R（範圍 -1 到目標R）
 */
export function calculateActualExitR(
  actualExitTicks: number,
  stopLossTicks: number
): number {
  if (stopLossTicks === 0) return 0
  return Number((actualExitTicks / stopLossTicks).toFixed(2))
}

/**
 * 根據實際出場 R 判斷輸贏
 * @param actualExitR 實際出場 R
 * @returns 'win' | 'loss' | 'breakeven'
 */
export function determineWinLoss(
  actualExitR: number
): 'win' | 'loss' | 'breakeven' {
  if (actualExitR > 0.1) return 'win'
  if (actualExitR < -0.1) return 'loss'
  return 'breakeven'
}
