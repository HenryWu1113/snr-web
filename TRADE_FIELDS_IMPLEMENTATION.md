# 交易紀錄新增欄位實施計畫 📋

## 📌 需求總覽

新增三個交易紀錄欄位：

1. **自定義標籤系統 (Custom Tags)** - 多選，可在設定頁面管理
2. **交易時段 (Trading Session)** - 根據圖表日期時間自動判斷（亞洲盤/倫敦盤/紐約盤）
3. **持倉時間 (Holding Time)** - 儲存為數字（分鐘）

---

## 🎯 實施階段

### 階段一：資料庫層 (Database Layer)

#### 1.1 新增 TradingTag Model (自定義標籤)
**檔案**: `prisma/schema.prisma`

```prisma
model TradingTag {
  id           String   @id @default(uuid())
  name         String   @unique
  displayOrder Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tradeTags TradeTag[]

  @@map("trading_tags")
}
```

#### 1.2 新增 TradeTag 關聯表 (多對多)
**檔案**: `prisma/schema.prisma`

```prisma
model TradeTag {
  id     String @id @default(uuid())
  tradeId String @map("trade_id")
  tagId   String @map("tag_id")

  trade Trade       @relation(fields: [tradeId], references: [id], onDelete: Cascade)
  tag   TradingTag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([tradeId, tagId])
  @@index([tradeId])
  @@index([tagId])
  @@map("trade_tags")
}
```

#### 1.3 新增 TradingSession Enum
**檔案**: `prisma/schema.prisma`

```prisma
enum TradingSession {
  ASIAN    // 亞洲盤
  LONDON   // 倫敦盤
  NEWYORK  // 紐約盤
  OVERLAP  // 重疊時段（可選）
}
```

#### 1.4 更新 Trade Model
**檔案**: `prisma/schema.prisma`

在 `Trade` model 中新增：

```prisma
model Trade {
  // ... 現有欄位 ...

  tradeDate   DateTime @map("trade_date") // 已存在，需改為 DateTime 類型（包含時分秒）
  
  // 新增欄位
  tradingSession TradingSession? @map("trading_session") // 交易時段（自動計算）
  holdingTimeMinutes Int?         @map("holding_time_minutes") // 持倉時間（分鐘）
  
  // 多對多關聯
  tradeTags TradeTag[] // 自定義標籤

  // ... 其他欄位 ...
  
  @@index([tradingSession]) // 新增索引
}
```

#### 1.5 Migration 執行
**指令**:
```bash
npx prisma migrate dev --name add_tags_session_holding_time
npx prisma generate
```

---

### 階段二：前端驗證層 (Validation Layer)

#### 2.1 更新 tradeFormSchema
**檔案**: `src/lib/validations/trade.ts`

```typescript
export const tradeFormSchema = z
  .object({
    // ... 現有欄位 ...
    
    // 修改：tradeDate 改為帶時分秒的 DateTime
    tradeDate: z.date({
      message: '請選擇交易日期與時間（圖表日期）'
    }),
    
    // 新增欄位
    tagIds: z.array(z.string()).optional(), // 自定義標籤（多選）
    
    // tradingSession 自動計算，不需要在表單中輸入
    
    holdingTimeMinutes: z.coerce
      .number({ message: '持倉時間必須是數字' })
      .int('持倉時間必須是整數')
      .positive('持倉時間必須大於 0')
      .optional(),
    
    // ... 其他欄位 ...
  })
```

#### 2.2 新增交易時段自動判斷函數
**檔案**: `src/lib/trading-session.ts` (新建)

```typescript
import { TradingSession } from '@prisma/client'

/**
 * 根據交易日期時間判斷交易時段
 * @param tradeDate 交易日期時間（使用者時區）
 * @param userTimezone 使用者時區（預設 'Asia/Taipei'）
 * @returns TradingSession
 */
export function determineTradingSession(
  tradeDate: Date,
  userTimezone: string = 'Asia/Taipei'
): TradingSession {
  // 將使用者時區的時間轉換為 UTC
  const utcHour = new Date(
    tradeDate.toLocaleString('en-US', { timeZone: 'UTC' })
  ).getHours()

  // 亞洲盤：00:00-09:00 UTC (台北時間 08:00-17:00)
  if (utcHour >= 0 && utcHour < 9) {
    return 'ASIAN'
  }
  // 倫敦盤：08:00-17:00 UTC (台北時間 16:00-01:00)
  else if (utcHour >= 8 && utcHour < 17) {
    return 'LONDON'
  }
  // 紐約盤：13:00-22:00 UTC (台北時間 21:00-06:00)
  else if (utcHour >= 13 && utcHour < 22) {
    return 'NEWYORK'
  }
  // 亞洲盤深夜時段
  else {
    return 'ASIAN'
  }
}
```

---

### 階段三：API 層 (Backend API)

#### 3.1 新增 TradingTag 管理 API
**檔案**: `src/app/api/trading-tags/route.ts` (新建)

參考 `entry-types/route.ts` 實作 CRUD：
- `GET` - 取得所有標籤
- `POST` - 新增標籤
- `PUT` - 更新標籤
- `DELETE` - 刪除標籤（含使用檢查）

#### 3.2 更新 Trades API
**檔案**: `src/app/api/trades/route.ts`

在 `POST` 和 `PUT` 處理中：
1. 接收 `tagIds` 欄位
2. 根據 `tradeDate` 自動計算 `tradingSession`
3. 儲存 `holdingTimeMinutes`
4. 建立/更新 `TradeTag` 關聯

```typescript
// 範例：POST /api/trades
const { tagIds, tradeDate, holdingTimeMinutes, ...otherData } = validatedData

// 自動判斷交易時段
const tradingSession = determineTradingSession(tradeDate)

const newTrade = await prisma.trade.create({
  data: {
    ...otherData,
    tradeDate,
    tradingSession,
    holdingTimeMinutes,
    // 建立標籤關聯
    tradeTags: {
      create: tagIds?.map((tagId) => ({ tagId })) || []
    }
  }
})
```

#### 3.3 更新 Analytics API
**檔案**: `src/app/api/analytics/route.ts`

新增支援 `trading-session` 維度的統計分析。

---

### 階段四：UI 層 (Frontend Components)

#### 4.1 更新交易表單 - 日期時間選擇器
**檔案**: `src/components/forms/trade-modal.tsx`

將 `tradeDate` 的 `DatePicker` 改為支援時分秒選擇：
- 使用 `react-day-picker` 的 `mode="single"` + 時間選擇器
- 或使用 `<Input type="datetime-local">`

#### 4.2 新增自定義標籤多選元件
**檔案**: `src/components/forms/trade-modal.tsx`

參考現有的 `entryTypeIds` 多選實作：
```tsx
{/* 自定義標籤 */}
<div className="space-y-2">
  <Label>自定義標籤（可多選）</Label>
  <Controller
    name="tagIds"
    control={control}
    render={({ field }) => (
      <div className="grid grid-cols-2 gap-2">
        {tradingTags.map((tag) => (
          <div key={tag.id} className="flex items-center space-x-2">
            <Checkbox
              id={`tag-${tag.id}`}
              checked={field.value?.includes(tag.id)}
              onCheckedChange={(checked) =>
                handleCheckboxChange('tagIds', tag.id, !!checked)
              }
            />
            <label htmlFor={`tag-${tag.id}`}>{tag.name}</label>
          </div>
        ))}
      </div>
    )}
  />
</div>
```

#### 4.3 新增持倉時間輸入欄位
**檔案**: `src/components/forms/trade-modal.tsx`

```tsx
{/* 持倉時間（分鐘） */}
<div className="space-y-2">
  <Label htmlFor="holdingTimeMinutes">持倉時間（分鐘）</Label>
  <Input
    id="holdingTimeMinutes"
    type="number"
    placeholder="例如：120"
    {...register('holdingTimeMinutes')}
  />
  {errors.holdingTimeMinutes && (
    <p className="text-sm text-destructive">
      {errors.holdingTimeMinutes.message}
    </p>
  )}
</div>
```

#### 4.4 顯示自動判斷的交易時段（唯讀）
**檔案**: `src/components/forms/trade-modal.tsx`

```tsx
{/* 交易時段（自動判斷） */}
<div className="space-y-2">
  <Label>交易時段（自動判斷）</Label>
  <div className="text-sm text-muted-foreground">
    {watchedTradeDate 
      ? getSessionLabel(determineTradingSession(watchedTradeDate))
      : '請先選擇交易日期時間'}
  </div>
</div>
```

#### 4.5 新增設定頁面 - TradingTag 管理
**檔案**: `src/app/settings/trading-tags/page.tsx` (新建)

參考 `src/app/settings/entry-types/page.tsx` 實作，使用 `OptionCrudTemplate` 元件。

#### 4.6 更新設定頁面導航
**檔案**: `src/app/settings/page.tsx` 或設定選單元件

新增「自定義標籤」選項連結。

---

### 階段五：資料表顯示 (DataTable)

#### 5.1 更新 trade-columns.tsx
**檔案**: `src/config/trade-columns.tsx`

新增三個欄位的定義：
```tsx
// 自定義標籤
{
  id: 'tags',
  accessorKey: 'tradeTags',
  header: '標籤',
  cell: ({ row }) => {
    const tags = row.original.tradeTags || []
    return (
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge key={tag.id} variant="outline">
            {tag.tag.name}
          </Badge>
        ))}
      </div>
    )
  }
},

// 交易時段
{
  id: 'tradingSession',
  accessorKey: 'tradingSession',
  header: '交易時段',
  cell: ({ row }) => {
    const session = row.getValue('tradingSession') as string | null
    return session ? getSessionLabel(session) : '-'
  }
},

// 持倉時間
{
  id: 'holdingTime',
  accessorKey: 'holdingTimeMinutes',
  header: '持倉時間',
  cell: ({ row }) => {
    const minutes = row.getValue('holdingTimeMinutes') as number | null
    if (!minutes) return '-'
    
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }
}
```

#### 5.2 更新 TradeWithRelations 型別
**檔案**: `src/types/datatable.ts`

```typescript
export interface TradeWithRelations {
  // ... 現有欄位 ...
  tradingSession: 'ASIAN' | 'LONDON' | 'NEWYORK' | null
  holdingTimeMinutes: number | null
  tradeTags: {
    id: string
    tag: {
      id: string
      name: string
    }
  }[]
}
```

---

### 階段六：Analytics 整合

#### 6.1 新增交易時段分析頁面
**檔案**: `src/app/analytics/trading-session/page.tsx` (新建)

參考 `position/page.tsx` 實作。

#### 6.2 新增自定義標籤分析頁面
**檔案**: `src/app/analytics/tags/page.tsx` (新建)

參考 `entry-type/page.tsx` 實作（因為都是多對多關係）。

#### 6.3 新增持倉時間分析頁面
**檔案**: `src/app/analytics/holding-time/page.tsx` (新建)

可以分組分析：
- 0-30分鐘
- 30-60分鐘
- 1-2小時
- 2-4小時
- 4小時以上

#### 6.4 更新 Analytics 導航
**檔案**: `src/app/analytics/page.tsx`

新增三個分析維度的連結卡片。

---

## ✅ 檢查清單 (Checklist)

### 資料庫
- [ ] 新增 `TradingTag` model
- [ ] 新增 `TradeTag` 關聯表
- [ ] 新增 `TradingSession` enum
- [ ] 更新 `Trade` model（新增 3 個欄位）
- [ ] 執行 migration
- [ ] 驗證資料庫結構正確

### 後端 API
- [ ] 實作 `/api/trading-tags` CRUD
- [ ] 更新 `/api/trades` 支援新欄位
- [ ] 實作 `determineTradingSession` 函數
- [ ] 更新 `/api/analytics` 支援新維度
- [ ] API 測試通過

### 前端驗證
- [ ] 更新 `tradeFormSchema`
- [ ] 新增時區處理邏輯
- [ ] 表單驗證測試通過

### UI 元件
- [ ] 更新 `tradeDate` 為 datetime picker
- [ ] 新增自定義標籤多選元件
- [ ] 新增持倉時間輸入欄位
- [ ] 顯示自動判斷的交易時段
- [ ] 新增設定頁面 - 標籤管理
- [ ] 更新設定頁面導航

### 資料表顯示
- [ ] 更新 `trade-columns.tsx`
- [ ] 更新 `TradeWithRelations` 型別
- [ ] 資料表正確顯示新欄位

### Analytics
- [ ] 新增交易時段分析頁面
- [ ] 新增自定義標籤分析頁面
- [ ] 新增持倉時間分析頁面
- [ ] 更新 Analytics 導航

---

## 🚨 注意事項

### 1. 時區處理
- 使用者在台灣時區（UTC+8）輸入交易時間
- 後端需要將時間轉換為 UTC 再判斷交易時段
- 建議在 `UserPreference` 中儲存使用者時區設定

### 2. 交易時段定義
當前時段定義（UTC 時間）：
- **亞洲盤**: 00:00-09:00 UTC
- **倫敦盤**: 08:00-17:00 UTC
- **紐約盤**: 13:00-22:00 UTC

注意：倫敦盤與紐約盤有重疊（13:00-17:00 UTC），可考慮：
- 優先分配給倫敦盤
- 或新增 `OVERLAP` 枚舉值

### 3. 持倉時間計算
- 考慮是否要自動計算（需要記錄開倉/平倉時間）
- 或由使用者手動輸入
- 建議：初期手動輸入，未來可新增自動計算功能

### 4. 向後相容性
- 現有交易紀錄的 `tradingSession` 與 `holdingTimeMinutes` 將為 `null`
- 前端需處理 `null` 值顯示
- 可考慮寫一個 migration script 自動填充現有資料

### 5. 自定義標籤刪除保護
- 參考 `entry-types` 的刪除檢查邏輯
- 刪除前檢查是否有交易使用該標籤

---

## 📦 相關檔案參考

- 多對多關係參考：`EntryType` ↔ `Trade` ↔ `TradeEntryType`
- 設定頁面參考：`src/app/settings/entry-types/page.tsx`
- CRUD 模板：`src/components/settings/option-crud-template.tsx`
- Analytics 參考：`src/app/analytics/entry-type/page.tsx`

---

## 🎯 預估工作時間

- 階段一（資料庫）: 30 分鐘
- 階段二（驗證）: 30 分鐘
- 階段三（API）: 1 小時
- 階段四（UI）: 2 小時
- 階段五（資料表）: 30 分鐘
- 階段六（Analytics）: 1.5 小時

**總計**: 約 6 小時

---

## 📝 備註

請桓哥檢查以下幾點：

1. **交易時段的 UTC 時間定義是否正確？**（我假設台北時區 UTC+8）
2. **重疊時段如何處理？**（倫敦與紐約 13:00-17:00 UTC）
3. **持倉時間是否需要自動計算？**（需要記錄開倉/平倉時間）
4. **自定義標籤是否有預設標籤清單？**（如 #追單、#情緒差 等）
5. **現有交易紀錄是否需要回填新欄位資料？**
