# 移除設置評分（Setup Rating）相關程式碼

## 已完成
- ✅ Prisma Schema - 移除 SetupRating 模型和 TradeSetupRating 關聯表
- ✅ 資料庫同步 - 執行 db push

## 需要更新的檔案

### 1. src/lib/validations/trade.ts
移除 `setupRatingIds` 欄位

### 2. src/app/api/trades/route.ts
移除 tradeSetupRatings 的建立邏輯和 include

### 3. src/app/api/trades/datatable/route.ts
移除 tradeSetupRatings 的 include

###  4. src/components/forms/add-trade-modal.tsx
- 移除 setupRatings 選項載入
- 移除設置評分的多選欄位
- 移除 defaultValues 中的 setupRatingIds

### 5. src/config/trade-columns.tsx
移除設置評分欄位定義

### 6. src/lib/datatable.ts
移除設置評分篩選邏輯（如果有）

### 7. 刪除 src/app/api/options/setup-ratings/route.ts
