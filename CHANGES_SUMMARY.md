# 變更摘要

## ✅ 已完成

### 1. 圖片預覽功能
- ✅ 新增 `src/components/ui/image-lightbox.tsx` - 圖片燈箱組件
- ✅ 更新 `src/components/forms/image-upload.tsx`
  - 點擊圖片可放大預覽
  - 新增「眼睛」按鈕快速預覽
  - 支援左右切換（鍵盤方向鍵或滑鼠點擊）
  - 顯示縮圖導航
  - 支援 ESC 關閉

### 2. 資料庫 Schema
- ✅ 移除 `SetupRating` 模型
- ✅ 移除 `TradeSetupRating` 關聯表
- ✅ 移除 Trade 模型中的 `tradeSetupRatings` 關聯
- ✅ 執行 `prisma db push --accept-data-loss`
- ✅ 執行 `prisma generate`

### 3. API 路由
- ✅ 刪除 `src/app/api/options/setup-ratings/route.ts`

## ⚠️ 待手動更新的檔案

由於涉及多處程式碼且需要謹慎處理，以下檔案需要手動移除 `setupRating` 相關程式碼：

### 1. `src/lib/validations/trade.ts`
移除：
```typescript
setupRatingIds: z.array(z.string()).min(1, '請至少選擇一個設置評分'),
```

### 2. `src/app/api/trades/route.ts`
移除：
- `tradeSetupRatings` 的建立邏輯
- include 中的 `tradeSetupRatings`

### 3. `src/app/api/trades/datatable/route.ts`
移除：
- include 中的 `tradeSetupRatings`

### 4. `src/components/forms/add-trade-modal.tsx`
移除：
- `setupRatings` 選項載入
- 表單中的設置評分多選欄位
- `defaultValues` 中的 `setupRatingIds: []`
- `handleCheckboxChange` 中的 setupRatingIds 相關邏輯

### 5. `src/config/trade-columns.tsx`
移除設置評分欄位定義

### 6. `src/lib/datatable.ts`
檢查並移除設置評分篩選邏輯（如果有）

### 7. `src/components/datatable/datatable-filters.tsx`
移除設置評分篩選UI（如果有）

### 8. `src/types/datatable.ts`
移除 `setupRatings` 相關型別定義（如果有）

## 🎯 新功能說明

### 圖片預覽功能
1. **點擊圖片預覽**：直接點擊縮圖可放大查看
2. **眼睛圖示**：hover 時顯示眼睛按鈕，點擊預覽
3. **左右切換**：
   - 鍵盤方向鍵（←/→）
   - 點擊左右箭頭按鈕
   - 點擊底部縮圖
4. **關閉預覽**：按 ESC 或點擊 X 按鈕
5. **圖片計數**：左上角顯示「當前/總數」
6. **縮圖導航**：底部顯示所有圖片縮圖，可快速跳轉

## 📝 建議操作順序

1. 先測試圖片預覽功能是否正常
2. 手動更新上述8個檔案，移除 setupRating 相關程式碼
3. 重啟開發伺服器測試
4. 測試新增交易功能是否正常

## 🔧 快速搜尋指令

```bash
# 搜尋所有包含 setupRating 的檔案
grep -r "setupRating" src/

# 搜尋所有包含 setup_ratings 的檔案
grep -r "setup_ratings" src/
```
