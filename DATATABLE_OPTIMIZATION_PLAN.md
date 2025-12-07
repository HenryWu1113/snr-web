# 🚀 DataTable 優化方案

## 核心發現

✅ **後端 API 不使用 `columnVisibility` 篩選資料**  
- 後端永遠回傳完整資料
- 前端用 `columnVisibility` 控制顯示/隱藏
- **結論：改變欄位顯示不需要重新載入資料！**

---

## 需要的修改

### 1. **改用 React Query 載入交易資料** ✅ (已建立 hook)
- 檔案：`src/hooks/use-trades-query.ts` ✅
- 快取時間：1 分鐘
- 提供手動刷新功能

### 2. **修改 trade-datatable.tsx** (重點)

#### A. 移除舊的 fetch 邏輯，改用 React Query

```typescript
// ❌ 舊的
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const fetchData = async () => { ... }

// ✅ 新的
const request = useMemo(() => ({
  pagination: { page, pageSize },
  sort,
  filters: { ...filters, ...stableFixedFilters },
  columnVisibility, // 仍會傳送，但後端不使用
}), [page, pageSize, sort, filters, stableFixedFilters, columnVisibility])

const { data, isLoading, error, refetch } = useTrades(request)
const refresh = useRefreshTrades()
```

#### B. 欄位顯示設定 - 改成點確定才儲存

目前 `DataTableToolbar` 中的欄位選擇器每次點擊都：
1. 更新 `columnVisibility` ✅
2. 呼叫 `saveColumnVisibility()` ❌ (不需要立即儲存)
3. 觸發重新載入 ❌ (不需要，因為資料已經有了)

**應該改成**：
```typescript
// 在 DataTableToolbar 中
const [localColumnVisibility, setLocalColumnVisibility] = useState(columnVisibility)

// 點擊欄位時只更新本地狀態
const handleColumnToggle = (columnId) => {
  setLocalColumnVisibility(prev => ({ ...prev, [columnId]: !prev[columnId] }))
}

// 點擊「套用」按鈕時
const handleApply = async () => {
  setColumnVisibility(localColumnVisibility) // 更新父組件狀態
  await saveColumnVisibility(localColumnVisibility) // 儲存設定
  // 不需要重新載入資料！
}
```

#### C. 加入手動刷新按鈕

在工具列左側加入：

html
<Button
  variant="outline"
  size="sm"
  onClick={() => refresh()}
  title="手動刷新資料"
>
  <RefreshCw className="h-4 w-4" />
</Button>


---

## 實作步驟

因為 `trade-datatable.tsx` 的修改太大（550+ 行），建議：

### 選項 A: 重構核心部分 (推薦)

1. 用 React Query hook 替換 fetchData
2. 移除 columnVisibility 對重新載入的觸發
3. 加入刷新按鈕

### 選項 B: 完整重寫 (穩妥但費時)

建立新的 `trade-datatable-v2.tsx`，從頭開始用 React Query 架構。

---

## 您想怎麼做？

我可以：
1. **幫您完整重構** trade-datatable.tsx (需要仔細處理，避免破壞現有功能)
2. **建立關鍵修改的程式碼片段**，您自己貼上
3. **先只加刷新按鈕**，其他慢慢改

**或者告訴我您的偏好？** 😊

---

## 預期效果

修改完成後：

| 操作 | 目前 | 修改後 |
|------|------|--------|
| 切換頁面 | 2秒 | **立即（快取）或 2秒（過期）** |
| 換頁（回到已看過的頁） | 2秒 | **立即（快取）** |
| 改變欄位顯示 | 2秒（重新載入）❌ | **立即（不重新載入）** ✅ |
| 點刷新按鈕 | - | **強制重新載入** |
| 修改交易後 | 自動重新載入 | 自動 invalidate 快取 |
